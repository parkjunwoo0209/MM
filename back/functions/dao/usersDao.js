// MM/functions/dao/usersDao.js

const { db } = require("../firebaseConfig");

// 이메일 중복 확인 함수
const checkDuplicateEmail = async (email) => {
  const snapshot = await db.collection("Users").where("email", "==", email).get();
  if (!snapshot.empty) {
    throw new Error("이미 등록된 이메일입니다.");
  }
};

// 사용자 등록하기
exports.registerUser = async ({ email, passwd }) => {
  try {
    // 이메일 중복 확인
    await checkDuplicateEmail(email);

    const usersRef = db.collection("Users");
    await usersRef.add({
      email,
      passwd,
    });
    return "성공적으로 회원가입 되었습니다.";
  } catch (error) {
    console.error("Registration error:", error);
    throw error; // 원본 에러 전달
  }
};

// 사용자 정보 조회하기
exports.getUserProfile = async (uid) => {
  try {
    const userDoc = await db.collection("Users").doc(uid).get();
    if (!userDoc.exists) {
      throw new Error("User not found");
    }
    return userDoc.data();
  } catch (error) {
    throw new Error(`Error fetching user profile: ${error.message}`);
  }
};

// 사용자 사용 기록 업데이트하기
exports.updateUsageHistory = async (userId, startStation, endStation) => {
  try {
    const usageRef = db.collection("UsageHistory").doc(`${userId}_${startStation}_${endStation}`);
    const usageDoc = await usageRef.get();

    if (usageDoc.exists) {
      const usageData = usageDoc.data();
      const newCount = usageData.count + 1;
      await usageRef.update({ count: newCount });
    } else {
      await usageRef.set({ userId, startStation, endStation, count: 1 });
    }
  } catch (error) {
    throw new Error(`Error updating usage history: ${error.message}`);
  }
};

// 로그인 검증 함수 수정
exports.verifyUser = async ({ email, passwd }) => {
  try {
    const usersRef = db.collection("Users");
    const snapshot = await usersRef.where("email", "==", email).get();
    
    if (snapshot.empty) {
      console.log("이메일이 존재하지 않음:", email);
      return false;
    }

    // 이메일 중복 체크
    if (snapshot.size > 1) {
      console.error("중복된 이메일이 존재함:", email);
      throw new Error("중복된 계정이 존재합니다. 관리자에게 문의하세요.");
    }

    // 비밀번호 확인
    const userData = snapshot.docs[0].data();
    if (userData.passwd === passwd) {
      console.log("로그인 성공:", email);
      return true;
    } else {
      console.log("비밀번호 불일치:", email);
      return false;
    }

  } catch (error) {
    console.error("Login verification error:", error);
    throw error;
  }
};