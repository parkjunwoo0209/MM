// MM/functions/scripts/insertStationsData.js

const admin = require("firebase-admin");

// Firebase Admin 초기화 (초기화된 앱이 없을 경우에만 초기화)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require("../../firebaseKey.json")),
        databaseURL: "https://metro-map-5f2e7-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
}

const db = admin.firestore();

async function insertStationsData() {
    try {
        // 역 데이터 정의
        const stationsData = [
            { stationID: "101", stationName: "101", lines: [1, 2] }, // 환승역 (Line 1, Line 2)
            { stationID: "102", stationName: "102", lines: [1] },
            { stationID: "103", stationName: "103", lines: [1] },
            { stationID: "104", stationName: "104", lines: [1, 4] }, // 환승역 (Line 1, Line 4)
            { stationID: "105", stationName: "105", lines: [1] },
            { stationID: "106", stationName: "106", lines: [1] },
            { stationID: "107", stationName: "107", lines: [1, 3] }, // 환승역 (Line 1, Line 3)
            { stationID: "108", stationName: "108", lines: [1] },
            { stationID: "109", stationName: "109", lines: [1, 5] }, // 환승역 (Line 1, Line 5)
            { stationID: "110", stationName: "110", lines: [1] },
            { stationID: "111", stationName: "111", lines: [1] },
            { stationID: "112", stationName: "112", lines: [1, 9] }, // 환승역 (Line 1, Line 9)
            { stationID: "113", stationName: "113", lines: [1, 8] }, // 환승역 (Line 1, Line 8)
            { stationID: "114", stationName: "114", lines: [1] },
            { stationID: "115", stationName: "115", lines: [1, 4] }, // 환승역 (Line 1, Line 4)
            { stationID: "116", stationName: "116", lines: [1, 6] }, // 환승역 (Line 1, Line 6)
            { stationID: "117", stationName: "117", lines: [1] },
            { stationID: "118", stationName: "118", lines: [1] },
            { stationID: "119", stationName: "119", lines: [1, 9] }, // 환승역 (Line 1, Line 9)
            { stationID: "120", stationName: "120", lines: [1] },
            { stationID: "121", stationName: "121", lines: [1, 6] }, // 환승역 (Line 1, Line 6)
            { stationID: "122", stationName: "122", lines: [1, 5] }, // 환승역 (Line 1, Line 5)
            { stationID: "123", stationName: "123", lines: [1, 3] }, // 환승역 (Line 1, Line 3)
            { stationID: "201", stationName: "201", lines: [2] },
            { stationID: "202", stationName: "202", lines: [2, 7] }, // 환승역 (Line 2, Line 7)
            { stationID: "203", stationName: "203", lines: [2] },
            { stationID: "204", stationName: "204", lines: [2] },
            { stationID: "205", stationName: "205", lines: [2] },
            { stationID: "206", stationName: "206", lines: [2] },
            { stationID: "207", stationName: "207", lines: [2, 3] }, // 환승역 (Line 2, Line 3)
            { stationID: "208", stationName: "208", lines: [2] },
            { stationID: "209", stationName: "209", lines: [2, 5] }, // 환승역 (Line 2, Line 5)
            { stationID: "210", stationName: "210", lines: [2] },
            { stationID: "211", stationName: "211", lines: [2, 9] }, // 환승역 (Line 2, Line 9)
            { stationID: "212", stationName: "212", lines: [2] },
            { stationID: "213", stationName: "213", lines: [2] },
            { stationID: "214", stationName: "214", lines: [2, 8] }, // 환승역 (Line 2, Line 8)
            { stationID: "215", stationName: "215", lines: [2] },
            { stationID: "216", stationName: "216", lines: [2, 4] }, // 환승역 (Line 2, Line 4)
            { stationID: "217", stationName: "217", lines: [2] },
            { stationID: "301", stationName: "301", lines: [3] },
            { stationID: "302", stationName: "302", lines: [3] },
            { stationID: "303", stationName: "303", lines: [3, 7] },
            { stationID: "304", stationName: "304", lines: [3] },
            { stationID: "305", stationName: "305", lines: [3] },
            { stationID: "306", stationName: "306", lines: [3] },
            { stationID: "307", stationName: "307", lines: [3, 4] },
            { stationID: "308", stationName: "308", lines: [3] },
            { stationID: "401", stationName: "401", lines: [4] },
            { stationID: "402", stationName: "402", lines: [4] },
            { stationID: "403", stationName: "403", lines: [4, 5] },
            { stationID: "404", stationName: "404", lines: [4] },
            { stationID: "405", stationName: "405", lines: [4] },
            { stationID: "406", stationName: "406", lines: [4, 9] },
            { stationID: "407", stationName: "407", lines: [4] },
            { stationID: "408", stationName: "408", lines: [4] },
            { stationID: "409", stationName: "409", lines: [4, 8] },
            { stationID: "410", stationName: "410", lines: [4] },
            { stationID: "411", stationName: "411", lines: [4] },
            { stationID: "412", stationName: "412", lines: [4, 6] },
            { stationID: "413", stationName: "413", lines: [4] },
            { stationID: "414", stationName: "414", lines: [4] },
            { stationID: "415", stationName: "415", lines: [4] },
            { stationID: "416", stationName: "416", lines: [4, 7] },
            { stationID: "417", stationName: "417", lines: [4, 6] },
            { stationID: "501", stationName: "501", lines: [5] },
            { stationID: "502", stationName: "502", lines: [5] },
            { stationID: "503", stationName: "503", lines: [5, 7] },
            { stationID: "504", stationName: "504", lines: [5] },
            { stationID: "505", stationName: "505", lines: [5] },
            { stationID: "506", stationName: "506", lines: [5] },
            { stationID: "507", stationName: "507", lines: [5] },
            { stationID: "601", stationName: "601", lines: [6, 7] },
            { stationID: "602", stationName: "602", lines: [6] },
            { stationID: "603", stationName: "603", lines: [6] },
            { stationID: "604", stationName: "604", lines: [6] },
            { stationID: "605", stationName: "605", lines: [6, 9] },
            { stationID: "606", stationName: "606", lines: [6] },
            { stationID: "607", stationName: "607", lines: [6] },
            { stationID: "608", stationName: "608", lines: [6, 8] },
            { stationID: "609", stationName: "609", lines: [6] },
            { stationID: "610", stationName: "610", lines: [6] },
            { stationID: "611", stationName: "611", lines: [6] },
            { stationID: "612", stationName: "612", lines: [6] },
            { stationID: "613", stationName: "613", lines: [6] },
            { stationID: "614", stationName: "614", lines: [6, 7] },
            { stationID: "615", stationName: "615", lines: [6] },
            { stationID: "616", stationName: "616", lines: [6] },
            { stationID: "617", stationName: "617", lines: [6] },
            { stationID: "618", stationName: "618", lines: [6, 8] },
            { stationID: "619", stationName: "619", lines: [6] },
            { stationID: "620", stationName: "620", lines: [6] },
            { stationID: "621", stationName: "621", lines: [6, 9] },
            { stationID: "622", stationName: "622", lines: [6] },
            { stationID: "701", stationName: "701", lines: [7] },
            { stationID: "702", stationName: "702", lines: [7, 9] },
            { stationID: "703", stationName: "703", lines: [7] },
            { stationID: "704", stationName: "704", lines: [7] },
            { stationID: "705", stationName: "705", lines: [7, 8] },
            { stationID: "706", stationName: "706", lines: [7] },
            { stationID: "707", stationName: "707", lines: [7] },
            { stationID: "801", stationName: "801", lines: [8] },
            { stationID: "802", stationName: "802", lines: [8] },
            { stationID: "803", stationName: "803", lines: [8] },
            { stationID: "804", stationName: "804", lines: [8] },
            { stationID: "805", stationName: "805", lines: [8] },
            { stationID: "806", stationName: "806", lines: [8] },
            { stationID: "901", stationName: "901", lines: [9] },
            { stationID: "902", stationName: "902", lines: [9] },
            { stationID: "903", stationName: "903", lines: [9] },
            { stationID: "904", stationName: "904", lines: [9] },
        ];



        // Firestore에 역 정보 삽입
        for (const station of stationsData) {
            const { stationID, stationName, lines } = station;

            // 역 정보 Firestore에 저장
            await db.collection("Stations").doc(stationID).set({
                stationID,
                stationName,
                lines,
            });

            console.log(`Station ${stationID} added successfully`);
        }

        console.log("All station data inserted successfully");

    } catch (error) {
        console.error("Error inserting station data:", error);
    }
}

// 데이터베이스에 삽입 함수 실행
insertStationsData();
