// MM/functions/controllers/usersController.js

const { db } = require("../firebaseConfig");
const routesDao = require("../dao/routesDao");
const admin = require('firebase-admin');

// 사용자 등록하기
exports.register = async (req, res) => {
  try {
    const { email, passwd, fcmToken } = req.body;

    if (!email || !passwd) {
      return res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "올바른 이메일 형식이 아닙니다." });
    }

    // 이메일 중복 확인
    const snapshot = await db.collection("Users").where("email", "==", email).get();
    if (!snapshot.empty) {
      return res.status(409).json({ error: "이미 등록된 이메일입니다." });
    }

    await db.collection("Users").add({ email, passwd });
    await admin.firestore()
      .collection('users')
      .doc(email)
      .set({
        email,
        fcmToken,
        // ... 다른 사용자 정보
      });

    res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "회원가입 중 오류가 발생했습니다." });
  }
};

// 사용자 로그인 처리
exports.login = async (req, res) => {
  try {
    const { email, passwd } = req.body;
    
    if (!email || !passwd) {
      return res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
    }

    // Users 컬렉션에서 해당 이메일과 비밀번호로 사용자 확인
    const usersRef = db.collection("Users");
    const snapshot = await usersRef
      .where("email", "==", email)
      .where("passwd", "==", passwd)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 일치하지 않습니다." });
    }

    // 로그인 성공
    res.json({ 
      success: true, 
      message: "로그인 성공",
      user: {
        email: email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "로그인 중 오류가 발생했습니다." });
  }
};

// 사용자 정보 조회하기
exports.getProfile = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).send("User ID is required");
    }
    const result = await usersService.getUserProfile(uid);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).send(`Error fetching user profile: ${error.message}`);
  }
};

// 최근 검색어 추가
exports.addRecentSearch = async (req, res) => {
  try {
    const { email, stationName } = req.body;

    if (!email || !stationName) {
      return res.status(400).json({ error: "이메일과 역 이름이 필요합니다." });
    }

    // stationID로 역 존재 여부 확인
    const stationExists = await routesDao.checkStationExists(stationName);
    if (!stationExists) {
      return res.status(404).json({ error: "존재하지 않는 역입니다." });
    }

    // 최근 검색어 컬렉션에서 사용자의 검색 기록 확인
    const searchTextRef = db.collection("SearchText");
    const existingQuery = await searchTextRef
      .where("email", "==", email)
      .where("searchtext", "==", stationName)
      .get();

    // 중복 검색어가 없을 경우에만 추가
    if (existingQuery.empty) {
      await searchTextRef.add({
        email,
        searchtext: stationName
      });
    }

    res.status(201).json({ message: "검색어가 저장되었습니다." });
  } catch (error) {
    console.error("Recent search error:", error);
    res.status(500).json({ error: "검색어 저장 중 오류가 발생했습니다." });
  }
};

// 최근 검색 조회
exports.getRecentSearches = async (req, res) => {
  try {
    const { email } = req.params;
    console.log('검색어 조회 요청:', email); // 디버깅용 로그

    if (!email) {
      return res.status(400).json({ error: "이메일이 필요합니다." });
    }

    const searchTextRef = db.collection("SearchText");
    const snapshot = await searchTextRef
      .where("email", "==", email)
      .get();

    console.log('검색된 데이터:', snapshot.docs.map(doc => doc.data())); // 디버깅용 로그

    const searches = snapshot.docs.map(doc => ({
      id: doc.id,
      searchtext: doc.data().searchtext
    }));

    res.json(searches);
  } catch (error) {
    console.error("Error fetching recent searches:", error);
    res.status(500).json({ error: "검색 기록을 가져오는 중 오류가 발생했습니다." });
  }
};

// 최근 검색어 삭제
exports.deleteRecentSearch = async (req, res) => {
  try {
    const { email, searchId } = req.params;

    const searchDoc = await db.collection("SearchText").doc(searchId).get();
    
    if (!searchDoc.exists) {
      return res.status(404).json({ error: "검색 기록을 찾을 수 없습니다." });
    }

    if (searchDoc.data().email !== email) {
      return res.status(403).json({ error: "권한이 없습니다." });
    }

    await db.collection("SearchText").doc(searchId).delete();
    res.json({ message: "검색 기록이 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting recent search:", error);
    res.status(500).json({ error: "검색 기록 삭제 중 오류가 발생했습니다." });
  }
};

// 최근 검색어 전체 삭제
exports.deleteAllRecentSearches = async (req, res) => {
  try {
    const { email } = req.params;
    await usersService.deleteAllRecentSearches(email);
    res.json({ message: "모든 검색 기록이 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting all recent searches:", error);
    res.status(500).json({ error: "검색 기록 삭제 중 오류가 발생했습니다." });
  }
};