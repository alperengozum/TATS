import { initializeApp } from "firebase-admin/app";
initializeApp();
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldPath } from "firebase-admin/firestore";
import { response } from "express";

const db = getFirestore();

export const handleImage = onRequest(async (request, response) => {
   
    if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
    }   
    const {image, takenAt, createdAt} = request.body;
    
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

    const date = new Date(createdAt);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear().toString();
    const formattedDate = `${day}.${month}.${year}`;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

   
        
    const result = await externalResponse.json();
    const jsonString = result!.result.yemeklistesi; 

    const menuSummary = checkMenus(jsonString);
    const menuName = menuSummary!.combinedMenuName;
    
    const totalMenuPrice = await calculateTotalPriceFromOutput(menuSummary);

    const meal2List = await generateMeal2List(jsonString);

    const totalPrice =await calculateTotalPrice(meal2List);
    const totalCalories =await calculateTotalCalories(meal2List);

    await SaveToDatabase(totalMenuPrice, totalPrice, totalCalories, formattedDate);

    const savings = totalPrice - totalMenuPrice;
    const savingsPercentage = parseFloat(((savings / totalPrice) * 100).toFixed(2));

    

    const documentNames = getDaysOfCurrentMonth();
    logger.info("documentNames", documentNames);    
    const monthlyTotalCalories = await calculateMonthlyCalori(documentNames) + totalCalories;
    const monthlyTotalMenu = await calculateMonthlyMenuPrice(documentNames);
    const monthlyTotalPrice = await calculateMonthlyTotalPrice(documentNames);
    const monthlyTotalSavings = monthlyTotalPrice - monthlyTotalMenu;
    const monthlySavingsPercentage = parseFloat(((monthlyTotalSavings / monthlyTotalPrice) * 100).toFixed(2));

    

    const responseValue : IMealAnalysis = {
        id : "1",
        createdAt : formattedDate,
        image : result!.result.image,
        meals : meal2List,
        takenAt : formattedTime,
        totalCalories : totalCalories,
        totalPrice : totalPrice,
        menuType : menuName,
        menuPrice : totalMenuPrice,
        savingsPercentage : savingsPercentage,
        monthlyTotalCalories : monthlyTotalCalories,
        monthlyTotalCost : monthlyTotalMenu,
        monthlyTotalSavings : monthlySavingsPercentage
    }
    response.status(200).send(JSON.stringify(responseValue));

});


function checkMenus(menuList : any[]) {
    const mainDishes = menuList?.filter(item => item.yemekKategorisi === "Ana Yemek");
    const sideDishes = menuList?.filter(item => item.yemekKategorisi === "Yardımcı Yemek");

    const waters = menuList?.filter(item => item.yemekKategorisi === "Su");
    const breads = menuList?.filter(item => item.yemekKategorisi === "Ekmek");

    const fixMenus = [];
    const menu2Etli = [];
    const menu2Etsiz = [];
    const menu3Etsiz = [];

    let remainingMainDishes = [...mainDishes];
    let remainingSideDishes = [...sideDishes];

    while (remainingMainDishes.length > 0 && remainingSideDishes.length >= 3) {
        fixMenus.push({
            mainDish: remainingMainDishes.shift(),
            sideDishes: remainingSideDishes.splice(0, 3),
            water: waters.length > 0 ? waters.pop() : null,
            bread: breads.length > 0 ? breads.pop() : null
        });
    }

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
            menu2Etli.push(menu);
        } else {
            menu2Etsiz.push(menu);
        }
    }

    while (remainingMainDishes.length > 0) {
        const mainDish = remainingMainDishes.shift();

        if (mainDish.altKategori !== "Etli") {
            menu3Etsiz.push({
                mainDish,
                water: waters.length > 0 ? waters.pop() : null,
                bread: breads.length > 0 ? breads.pop() : null
            });
        } else {
            remainingMainDishes.unshift(mainDish);
            break;
        }
    }

    const extraDishes = [...remainingMainDishes, ...remainingSideDishes, ...waters, ...breads];

    const extraDishSummary = extraDishes.reduce((acc, dish) => {
        acc[dish.yemekKategorisi] = (acc[dish.yemekKategorisi] || 0) + 1;
        return acc;
    }, {});

    const extraDishList = Object.entries(extraDishSummary).map(([kategori, count]) => ({
        kategori,
        count
    }));

    const menusSummary = [
        { menuName: "Fix Menü", count: fixMenus.length },
        { menuName: "Menü 1", count: menu2Etli.length },
        { menuName: "Menü 2", count: menu2Etsiz.length },
        { menuName: "Menü 3", count: menu3Etsiz.length }
    ];

    let combinedMenuName = menusSummary
        .filter(menu => menu.count > 0)
        .map(menu => menu.menuName)
        .join(" + ");

    if (menusSummary.every(menu => menu.count === 0)) {
        combinedMenuName = "-";
    } else if (combinedMenuName === "" && extraDishList.length > 0) {
        combinedMenuName = "Ekstralar";
    } else if (extraDishList.length > 0) {
        combinedMenuName += combinedMenuName ? " + Ekstralar" : "Ekstralar";
    }

    return {
        combinedMenuName,
        menusSummary,
        extraDishList
    };
}

async function calculateMonthlyCalori(documentNames: any[]) {
    let monthlyCalori = 0; 
    const promises = documentNames.map(async (docName) => {
        const doc = await db.collection("Yemek_Listesi").doc(docName).get();
        if (doc.exists) {
          const dailyCalori = doc.data()!.dailyCalori || 0; 
          return dailyCalori;
        } else {
          return 0; 
        }     
    });
  
    const dailyCalories = await Promise.all(promises);
    monthlyCalori = dailyCalories.reduce((sum, value) => sum + value, 0);
  
    return monthlyCalori;
  }

  async function calculateMonthlyMenuPrice(documentNames: any[]) {
    let monthlyMenu = 0; 
    const promises = documentNames.map(async (docName) => {

        const doc = await db.collection("Yemek_Listesi").doc(docName).get();
        if (doc.exists) {
          const dailyMenu = doc.data()!.dailyMenuPrice || 0; 
          return dailyMenu;
        } else {
          return 0; 
        }
    });
  
    const dailyMenus = await Promise.all(promises);
    monthlyMenu = dailyMenus.reduce((sum, value) => sum + value, 0);
  
    return monthlyMenu;
  }

  async function calculateMonthlyTotalPrice(documentNames: any[]) {
    let monthlyTotalPrice = 0; 
    const promises = documentNames.map(async (docName) => {
        const doc = await db.collection("Yemek_Listesi").doc(docName).get();
        if (doc.exists) {
          const dailyTotal = doc.data()!.dailyTotalPrice || 0; 
          return dailyTotal;
        } else {
          return 0; 
         }
    });
  
    const dailyTotals = await Promise.all(promises);
    monthlyTotalPrice = dailyTotals.reduce((sum, value) => sum + value, 0);
  
    return monthlyTotalPrice;
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
        const price = await getPrice(item.altKategori) || 0; 
  
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

async function SaveToDatabase(
    dailyMenuPrice: number,
    dailyTotalPrice: number,
    dailyCalori: number,
    dailyDate: string
) 
{
    const docRef = db.collection("Yemek_Listesi").doc(dailyDate);
  
    docRef.get().then((doc) => {
      if (doc.exists) {
        const data = doc.data();
        const updatedDailyMenuPrice = (data!.dailyMenuPrice || 0) + dailyMenuPrice;
        const updatedDailyTotalPrice = (data!.dailyTotalPrice || 0) + dailyTotalPrice;
        const updatedDailyCalori = (data!.dailyCalori || 0) + dailyCalori;
  
        docRef.set({
          dailyMenuPrice: updatedDailyMenuPrice,
          dailyTotalPrice: updatedDailyTotalPrice,
          dailyCalori: updatedDailyCalori,
        });
      } else {
        docRef.set({
          dailyMenuPrice: dailyMenuPrice,
          dailyTotalPrice: dailyTotalPrice,
          dailyCalori: dailyCalori,
        });
      }
    });
}
  
async function calculateTotalPrice(mealList: Partial<IMeal>[]): Promise<number> {
    return mealList.reduce((total, meal) => total + meal.price! * meal.quantity!, 0);
}

async function calculateTotalCalories(mealList: Partial<IMeal>[]): Promise<number> {
    return mealList.reduce((total, meal) => total + meal.calories! * meal.quantity!, 0);
}

async function calculateTotalPriceFromOutput(output: any) {
    let total = 0;

    for (const menu of output.menusSummary) {
        if (menu.count > 0) {
            const price = await getPrice(menu.menuName); 
            if (price !== null) {
                total += price * menu.count;
            }
        }
    }

    for (const extraDish of output.extraDishList) {
        const price = await getPrice(extraDish.kategori); 
        if (price !== null) {
            total += price * extraDish.count;
        }
    }

    return total;
}


function getDaysOfCurrentMonth() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; 
    const daysInMonth = new Date(year, month, 0).getDate();

    const daysList = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const formattedDay = String(day).padStart(2, '0');
        const formattedMonth = String(month).padStart(2, '0');
        daysList.push(`${formattedDay}.${formattedMonth}.${year}`);
    }

    return daysList;
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

  export interface IMealAnalysis {
	id: string;
	image: string;
	createdAt: string;
	takenAt: string;
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