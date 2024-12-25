"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleImage = void 0;
const app_1 = require("firebase-admin/app");
(0, app_1.initializeApp)();
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const firestore_1 = require("firebase-admin/firestore");
//import { getFirestore, FieldValue } from "firebase-admin/firestore";
//import { getMessaging } from "firebase-admin/messaging";
const db = (0, firestore_1.getFirestore)();
//const messaging = getMessaging();
exports.handleImage = (0, https_1.onRequest)(async (request, response) => {
    const menuList = [
        {
            yemekKategorisi: "Ana Yemek",
            altKategori: "Etli",
            altAltKategori: "Kırmızı Et",
            yemekAdi: "İzmir Köfte",
            kalori: 385
        },
        {
            yemekKategorisi: "Ana Yemek",
            altKategori: "Etli",
            altAltKategori: "Beyaz Et",
            yemekAdi: "Tavuk Şiş",
            kalori: 320
        },
        {
            yemekKategorisi: "Ana Yemek",
            altKategori: "Vejetaryen",
            altAltKategori: "Sebze",
            yemekAdi: "Sebzeli Makarna",
            kalori: 300
        },
        {
            yemekKategorisi: "Ana Yemek",
            altKategori: "Vejetaryen",
            altAltKategori: "Bakliyat",
            yemekAdi: "Mercimek Köftesi",
            kalori: 250
        },
        {
            yemekKategorisi: "Ana Yemek",
            altKategori: "Etli",
            altAltKategori: "Kırmızı Et",
            yemekAdi: "Kuzu Güveç",
            kalori: 450
        },
        {
            yemekKategorisi: "Yardımcı Yemek",
            altKategori: "Çorba",
            altAltKategori: "Diğer",
            yemekAdi: "Kremalı Sebze Çor.",
            kalori: 120
        },
        {
            yemekKategorisi: "Yardımcı Yemek",
            altKategori: "Pilav",
            altAltKategori: "Bulgur",
            yemekAdi: "Bulgur Pilavı",
            kalori: 200
        },
        {
            yemekKategorisi: "Yardımcı Yemek",
            altKategori: "Pilav",
            altAltKategori: "Bulgur",
            yemekAdi: "Bulgur Pilavı",
            kalori: 200
        },
        {
            yemekKategorisi: "Yardımcı Yemek",
            altKategori: "Salata",
            altAltKategori: "Yeşil",
            yemekAdi: "Çoban Salata",
            kalori: 90
        },
        {
            yemekKategorisi: "Yardımcı Yemek",
            altKategori: "Tatlı",
            altAltKategori: "Şerbetli",
            yemekAdi: "Baklava",
            kalori: 300
        },
        {
            yemekKategorisi: "Yardımcı Yemek",
            altKategori: "Sebze",
            altAltKategori: "Zeytinyağlı",
            yemekAdi: "Zeytinyağlı Enginar",
            kalori: 150
        },
        {
            yemekKategorisi: "Yardımcı Yemek",
            altKategori: "Meze",
            altAltKategori: "Humus",
            yemekAdi: "Humus",
            kalori: 180
        },
        {
            yemekKategorisi: "Yardımcı Yemek",
            altKategori: "Sebze",
            altAltKategori: "Zeytinyağlı",
            yemekAdi: "Zeytinyağlı Enginar",
            kalori: 150
        },
        {
            yemekKategorisi: "Su",
            altKategori: "Su",
            altAltKategori: "Su",
            yemekAdi: "Su",
            kalori: 180
        },
        {
            yemekKategorisi: "Ekmek",
            altKategori: "Ekmek",
            altAltKategori: "Ekmek",
            yemekAdi: "Ekmek",
            kalori: 180
        },
        {
            yemekKategorisi: "Su",
            altKategori: "Su",
            altAltKategori: "Su",
            yemekAdi: "Su",
            kalori: 180
        },
        {
            yemekKategorisi: "Ekmek",
            altKategori: "Ekmek",
            altAltKategori: "Ekmek",
            yemekAdi: "Ekmek",
            kalori: 180
        }
    ];
    if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
    }
    //const { image, takenAt, createdAt } = request.body;
    const { image, takenAt, createdAt } = request.body;
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
    const jsonString = result.result.yemeklistesi;
    logger.info(jsonString);
    checkMenus(jsonString);
    const meal2List = await generateMeal2List(jsonString);
    console.log(meal2List);
    const totalPrice = calculateTotalPrice(meal2List);
    const totalCalories = calculateTotalCalories(meal2List);
    const responseValue = {
        id: "1",
        createdAt: createdAt,
        image: result.result.image,
        meals: meal2List,
        takenAt: takenAt,
        totalCalories: totalCalories,
        totalPrice: totalPrice,
        menuType: "1",
        menuPrice: 1,
        savingsPercentage: 1,
        monthlyTotalCalories: 1,
        monthlyTotalCost: 1,
        monthlyTotalSavings: 1
    };
    response.status(200).send(JSON.stringify(responseValue));
});
function checkMenus(menuList) {
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
        }
        else {
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
        }
        else {
            // Eğer etli ana yemek varsa ve diğer menülere uymuyorsa ekstra olarak işaretlenir.
            remainingMainDishes.unshift(mainDish); // Bu yemeği ekstra yemekler için bırak
            break;
        }
    }
    // Geri kalan yemekler ve su/ekmek
    const extraMainDishes = remainingMainDishes; // Buradaki yemekler ekstra olacak
    const extraSideDishes = remainingSideDishes;
    const extraWaters = waters;
    const extraBreads = breads;
}
const getPrice = async (documentName) => {
    const docRef = db.collection('Yemekhane_price').doc(documentName);
    const doc = await docRef.get();
    if (doc.exists) {
        const data = doc.data();
        return data ? data.price : null;
    }
    else {
        return null;
    }
};
async function generateMeal2List(menuList) {
    const meal2Map = {};
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
        }
        else {
            meal2Map[name].quantity += 1;
        }
    }
    return Object.values(meal2Map);
}
// Toplam fiyat hesaplama metodu
function calculateTotalPrice(mealList) {
    return mealList.reduce((total, meal) => total + meal.price * meal.quantity, 0);
}
// Toplam kalori hesaplama metodu
function calculateTotalCalories(mealList) {
    return mealList.reduce((total, meal) => total + meal.calories * meal.quantity, 0);
}
function transformJsonStringToFormattedList(jsonString) {
    // Tek tırnakları çift tırnağa çevirerek JSON.parse edilebilir hale getiriyoruz
    const validJsonString = jsonString.replace(/'/g, '"');
    // JSON parse işlemi
    const parsedData = JSON.parse(validJsonString);
    logger.info(parsedData);
    // Format dönüşümü
    return parsedData.map((item) => ({
        yemekKategorisi: item.yemekKategorisi,
        altKategori: item.altKategori,
        altAltKategori: item.altAltKategori,
        yemekAdi: item.yemekAdi,
        kalori: item.kalori,
    }));
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
//# sourceMappingURL=index.js.map