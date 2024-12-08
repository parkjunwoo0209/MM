const request = require("supertest");
const { app } = require("../../index");
const admin = require("firebase-admin");
const test = require("firebase-functions-test")({
  projectId: "metro-map-5f2e7",
}, "../../../firebaseKey.json");

jest.mock("firebase-admin", () => {
  const originalModule = jest.requireActual("firebase-admin");
  return {
    ...originalModule,
    initializeApp: jest.fn(), // Firebase Admin SDK의 initializeApp 함수 모킹
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(),
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: jest.fn(() => ({ fcmToken: "test_fcm_token_123" }))
          }),
          delete: jest.fn(),
        }))
      }))
    }),
    messaging: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue("mockMessageId"), // FCM 메시지 전송 부분을 Mocking
    }),
  };
});

describe("Routes Controller - 경로 안내 및 알림 제공 테스트", () => {
  let db;
  const userId = "testUser123";

  beforeAll(async () => {
    db = admin.firestore();

    // Firestore에 테스트용 사용자 추가
    await db.collection("Users").doc(userId).set({
      email: "testuser123@example.com",
      fcmToken: "test_fcm_token_123",
    });
  });

  afterAll(async () => {
    // Firestore에 추가된 데이터 정리
    await db.collection("Users").doc(userId).delete();
    await db.collection("UserSelectedRoutes").doc(userId).delete();
    test.cleanup();
  });

  it("should provide route guidance and send notifications to the user", async () => {
    const selectedRoute = {
      path: ["101", "102", "103"],
      criteria: "distance",
      transfers: ["102"],
      distance: 1200,
      time: 1800,
      cost: 500,
    };

    // 요청을 보냅니다
    const response = await request(app)
      .post("/api/routes/selectOptimalRoute")
      .send({
        userId,
        selectedRoute,
      });

    // 응답 상태 코드가 200인지 확인
    expect(response.status).toBe(200);

    // Firestore에서 데이터 확인
    const storedRouteDoc = await db.collection("UserSelectedRoutes").doc(userId).get();
    expect(storedRouteDoc.exists).toBe(true);
    const storedData = storedRouteDoc.data();
    expect(storedData.selectedRoute).toEqual(selectedRoute);

    // FCM 메시지 전송 확인
    const messaging = admin.messaging();
    expect(messaging.send).toHaveBeenCalled(); // 알림 전송이 호출되었는지 확인
  });
});
