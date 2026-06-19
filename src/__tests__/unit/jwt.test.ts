import { describe, expect, it } from "@jest/globals";
import jwt from "jsonwebtoken";

const TEST_PAYLOAD = { id: 1, email: 'test@test.com', role: 'user' };
type payloadType = {
    id: number,
    email: string,
    role: 'user' | 'admin'
};
const TEST_SECRET = process.env.JWT_SECRET!;

//tests unitaires jwt
describe("UT-JWT SIGN", () => {
    it('Token exists', () => {
        //Act
        const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET, { expiresIn: '1h' });
        //Assert
        expect(token).toBeDefined();
    });

    it('Token is a string', () => {
        //Act
        const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET, { expiresIn: '1h' });
        //Assert
        expect(typeof token).toEqual('string');
    });

    it('Token is well formed', () => {
        //Act
        const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET, { expiresIn: '1h' });
        //Assert
        expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
    });
});

describe('UT-JWT VERIFY', () => {
    it('got  decoded token back', () => {
        //Arrange
        const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET, { expiresIn: '1h' });
        //Act
        const decoded = jwt.verify(token, TEST_SECRET) as payloadType;
        //Assert
        expect(decoded).toBeDefined();
        expect(decoded.id).toBeDefined();
        expect(decoded.email).toBeDefined();
        expect(decoded.role).toBeDefined();
    });

    it('throws jwt.JsonWebTokenError', () => {
        //Arrange
        const misToken = 'dsfmoijsdfdsoijmfdsmodsifjndosmf';
        //Act & Assert
        expect(() => {
            jwt.verify(misToken, TEST_SECRET);
        }).toThrow(jwt.JsonWebTokenError);
    });

    it('throws jwt.TokenExpiredError', async () => {
        //Act 
        const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET, { expiresIn: -1 });
        //Assert
        expect(() => {
            jwt.verify(token, TEST_SECRET);
        }).toThrow(jwt.TokenExpiredError);
    });
});

describe('UT-JWT PAYLOAD', () => {
    it('datas in token are correct', () => {
        //Act 
        const token = jwt.sign(TEST_PAYLOAD, TEST_SECRET, { expiresIn: '1h' });
        const decoded = jwt.verify(token, TEST_SECRET) as payloadType;
        //Assert 
        expect(TEST_PAYLOAD.id).toStrictEqual(decoded.id);
        expect(TEST_PAYLOAD.email).toStrictEqual(decoded.email);
        expect(TEST_PAYLOAD.role).toStrictEqual(decoded.role);
    });
});