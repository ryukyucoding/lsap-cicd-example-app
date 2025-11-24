const request = require('supertest');
const app = require('../app');  // 根據你的專案調整路徑

describe('GET /time', () => {
    it('should return current time in ISO format', async () => {
        const response = await request(app).get('/time');
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('time');
        
        // 驗證是否為有效的 ISO 8601 格式
        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
        expect(response.body.time).toMatch(isoRegex);
        
        // 驗證是否可以被解析為有效日期
        const date = new Date(response.body.time);
        expect(date.toString()).not.toBe('Invalid Date');
    });
});
