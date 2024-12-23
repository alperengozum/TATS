import { initializeApp } from "firebase-admin/app";
initializeApp();
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore } from "firebase-admin/firestore";

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
    const { image} = request.body;
    
    // Eksik alanları kontrol et
    if (!image) {
        response.status(400).send("Bad Request: Missing or invalid 'image'");
        return;
    }
    

    try {


        // tarih bilgisi dinamik olmalı
        const yemekListesiRef = db.collection("Yemek_Listesi").doc("yemekList").collection("01.12.2024");
        const snapshot = await yemekListesiRef.get();

        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }

        const yemekListesi: any[] = [];
        snapshot.forEach(doc => {
          yemekListesi.push(doc.data());
        });
      
        const externalResponse = await fetch("https://api.cortex.cerebrium.ai/v4/p-b1706473/fall-detection/run", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiJwLWIxNzA2NDczIiwiaWF0IjoxNjkyMjY4NjM4LCJleHAiOjIwMDc4NDQ2Mzh9.i4y2F5q8iPu8OqFHE8QBk3kkzdDmLios0VTxkx_J0W0ftkulVJZ3wGM97ySGTtT9avIveu5wmmIthF0-nfjXp7m8-I6RTg2NyIf9HNLvwIrAHF4g1oE5kIx8eEQc-WeGmOspLwKsF8_v4_xwN3yj-MDIDONVFFcvNik9Z6BFURGJEV0A0nz5g3fCgo13FUfQEI-mcXDuXz1vabC0xR60aisehP6pvSfjBDknOhW1s6Dvjbg-cULLT5EvcC7j71ud1sYYgaQqKZXH83uWaZvmscSr0YqlbNuCWNPEmouySpcJNwByJ_cZhy93gOpjljDHNvXRRRq2azclN24g8FalHQ"
          },
          body: JSON.stringify({ "image": image, "yemeklistesi": yemekListesi })
      });

      const result: IYemekModel = await externalResponse.json();

      // IYemekModel içindeki IMeal öğelerine erişim
      result.meals.forEach((meal: IMeal) => {
    
  });

      // Dönen verileri başka bir işlem için kullanın
       // Örneğin, dönen verileri Firestore'a kaydedebilirsiniz
     await db.collection("Processed_Yemek_Listesi").add(result);

  response.status(200).json(result);
       
    
    } catch (error) {
        logger.error("Error processing image", error);
        response.status(500).send("Internal Server Error");
    }
});



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