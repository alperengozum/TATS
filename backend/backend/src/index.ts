import { initializeApp } from "firebase-admin/app";
initializeApp();
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";
import { response } from "express";

//import { getFirestore, FieldValue } from "firebase-admin/firestore";
//import { getMessaging } from "firebase-admin/messaging";

const db = getFirestore();
//const messaging = getMessaging();

export const handleImage = onRequest(async (request, response) => {
   
    if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
    }   
    //const { image, takenAt, createdAt } = request.body;
    const {image, takenAt, createdAt} = request.body;
    
    // Eksik alanları kontrol et
    if (!image) {
        response.status(400).send("Bad Request: Missing or invalid 'image'");
        return;
    }
    if (!takenAt) {
        response.status(400).send("Bad Request: Missing or invalid 'takenAt'");
        return;
    }
    if (!createdAt) {
        response.status(400).send("Bad Request: Missing or invalid 'createdAt'");
        return;
    }


        const externalResponse = await fetch("https://api.cortex.cerebrium.ai/v4/p-b1706473/tats/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJwLWIxNzA2NDczIiwiaWF0IjoxNjkyMjY4NjM4LCJleHAiOjIwMDc4NDQ2Mzh9.i4y2F5q8iPu8OqFHE8QBk3kkzdDmLios0VTxkx_J0W0ftkulVJZ3wGM97ySGTtT9avIveu5wmmIthF0-nfjXp7m8-I6RTg2NyIf9HNLvwIrAHF4g1oE5kIx8eEQc-WeGmOspLwKsF8_v4_xwN3yj-MDIDONVFFcvNik9Z6BFURGJEV0A0nz5g3fCgo13FUfQEI-mcXDuXz1vabC0xR60aisehP6pvSfjBDknOhW1s6Dvjbg-cULLT5EvcC7j71ud1sYYgaQqKZXH83uWaZvmscSr0YqlbNuCWNPEmouySpcJNwByJ_cZhy93gOpjljDHNvXRRRq2azclN24g8FalHQ"
            },
            body: JSON.stringify({ "image": image })
        });
        
        const result = await externalResponse.json();
        const jsonString = result!.result.yemeklistesi;
        logger.info(jsonString);
   
       

    checkMenus(jsonString);

    const meal2List = await generateMeal2List(jsonString);
    console.log(meal2List);

    const totalPrice = calculateTotalPrice(meal2List);
    const totalCalories = calculateTotalCalories(meal2List);

    const responseValue : IMealAnalysis = {
        id : "1",
        createdAt : createdAt,
        image : result!.result.image,
        meals : meal2List,
        takenAt : takenAt,
        totalCalories : totalCalories,
        totalPrice : totalPrice,
        menuType : "1",
        menuPrice : 1,
        savingsPercentage : 1,
        monthlyTotalCalories : 1,
        monthlyTotalCost : 1,
        monthlyTotalSavings : 1
    }
    response.status(200).send(JSON.stringify(responseValue));

    
});


function checkMenus(menuList: any[]) {
    // Ana yemek ve yardımcı yemekleri ayır
    const mainDishes = menuList?.filter(item => item.yemekKategorisi === "Ana Yemek");
    const sideDishes = menuList?.filter(item => item.yemekKategorisi === "Yardımcı Yemek");
  
    // Su ve ekmekleri ayır
    const waters = menuList?.filter(item => item.yemekKategorisi === "Su");
    const breads = menuList?.filter(item => item.yemekKategorisi === "Ekmek");
  
    if (mainDishes.length < 1) {
      console.error("Menüleri oluşturmak için yeterli ana yemek yok.");
      return;
    }
  
    // Menülerin tutulacağı listeler
    const fixMenus = [];
    const asafMenusEtli = [];
    const asafMenusEtsiz = [];
    const mustafaMenusEtsiz = [];
  
    let remainingMainDishes = [...mainDishes];
    let remainingSideDishes = [...sideDishes];
  
    // Fix Menüleri oluştur
    while (remainingMainDishes.length > 0 && remainingSideDishes.length >= 3) {
      fixMenus.push({
        mainDish: remainingMainDishes.shift(),
        sideDishes: remainingSideDishes.splice(0, 3),
        water: waters.length > 0 ? waters.pop() : null,
        bread: breads.length > 0 ? breads.pop() : null
      });
    }
  
    // Asaf Menüleri oluştur (Etli ve Etsiz olarak ayır)
    while (remainingMainDishes.length > 0 && remainingSideDishes.length >= 1) {
      const mainDish = remainingMainDishes.shift();
      const sideDish = remainingSideDishes.shift();
      const menu = {
        mainDish,
        sideDish,
        water: waters.length > 0 ? waters.pop() : null,
        bread: breads.length > 0 ? breads.pop() : null
      };
  
      if (mainDish.altKategori === "Etli") {
        asafMenusEtli.push(menu);
      } else {
        asafMenusEtsiz.push(menu);
      }
    }
  
    // Mustafa Menüleri oluştur (Sadece Etsiz)
    while (remainingMainDishes.length > 0) {
      const mainDish = remainingMainDishes.shift();
  
      if (mainDish.altKategori !== "Etli") {
        mustafaMenusEtsiz.push({
          mainDish,
          water: waters.length > 0 ? waters.pop() : null,
          bread: breads.length > 0 ? breads.pop() : null
        });
      } else {
        // Eğer etli ana yemek varsa ve diğer menülere uymuyorsa ekstra olarak işaretlenir.
        remainingMainDishes.unshift(mainDish); // Bu yemeği ekstra yemekler için bırak
        break;
      }
    }
  
    // Geri kalan yemekler ve su/ekmek
    const extraMainDishes = remainingMainDishes;  // Buradaki yemekler ekstra olacak
    const extraSideDishes = remainingSideDishes;
    const extraWaters = waters;
    const extraBreads = breads;


  }

  const getPrice = async (documentName: string) => {
    const docRef = db.collection('Yemekhane_price').doc(documentName);
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      return data ? data.price : null;
    } else {
      return null;
    }
  };
  
  async function generateMeal2List(menuList: any[]): Promise<Partial<IMeal>[]> {
    const meal2Map: { [key: string]: Partial<IMeal> } = {};
  
    for (const item of menuList) {
      const name = item.yemekAdi;
      const generalType = item.yemekKategorisi;
      const calories = item.kalori;
      
      if (!meal2Map[name]) {
        const price = await getPrice(item.altKategori) || 0; // Fiyat bilgisi alınır
  
        meal2Map[name] = {
            quantity: 1,
          name,
          generalType,
          calories,
          price
        };
      } else {
        meal2Map[name].quantity! += 1;
      }
    }
  
    return Object.values(meal2Map);
  }

  // Toplam fiyat hesaplama metodu
function calculateTotalPrice(mealList: Partial<IMeal>[]): number {
    return mealList.reduce((total, meal) => total + meal.price! * meal.quantity!, 0);
}

// Toplam kalori hesaplama metodu
function calculateTotalCalories(mealList: Partial<IMeal>[]): number {
    return mealList.reduce((total, meal) => total + meal.calories! * meal.quantity!, 0);
}




export interface IYemekModel{
    image : string;
    meals: IMeal[];
}

export interface IMeal{
    name: string;
    generalType: string;
    specifiedType: string;
    exactType:string;
    calories:number;
    price:number;
    quantity: number;
}



  
  // Menü Bilgisi Modeli
  export interface IMealAnalysis {
	id: string;
	image: string;
	createdAt: number;
	takenAt: number;
	meals: Partial<IMeal>[];
	totalCalories: number;
	totalPrice: number;
	menuType: string;
	menuPrice: number;
	savingsPercentage: number;
	monthlyTotalCalories: number;
	monthlyTotalCost: number;
	monthlyTotalSavings: number;
}


  
  

/*

VERİ EKLEME
    await db.collection("Yemek_Listesi").doc("yemekList").collection("01.12.2024").doc("meal1").set({
        yemekKategorisi: "Yardımcı Yemek",
        altKategori: "Çorba",
        altAltKategori: "Çorba",
        yemekAdi: "Mercimek Çorbası",
        kalori: 155,
      });
      */