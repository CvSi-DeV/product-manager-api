import bcrypt from "bcrypt"
import { describe, it, expect, test } from "@jest/globals"

//tests unitaires bcrypt
describe('UT-bcrypt HASH', () => {
    it('Hash is not undefined', async () => {
        //Arrange
        const mdp = 'mdptest';
        const nbSalt = 10;
        //Act
        const hashed = await bcrypt.hash(mdp, nbSalt);
        //Assert
        expect(hashed).toBeDefined();
    });

    test('Hash is type string', async () => {
        //Arrange
        const mdp = 'mdptestSDSQDQSFDSF';
        const nbSalt = 10;
        //Act
        const hashed = await bcrypt.hash(mdp, nbSalt);
        //Assert
        expect(typeof hashed).toBe('string');
    });

    it('Hash must start with $2b$', async () => {
        //Arrange
        const mdp = 'DSFDSf?.V.EROGRFKO¨REKFRÖFK.EFG¨KDF.';
        const nbSalt = 10;
        const valueToMatch = '$2b$'
        //Act
        const hashed = await bcrypt.hash(mdp, nbSalt);
        //Assert
        expect(hashed).toContain(valueToMatch);
    });

    it('Hash must be different from password', async () => {
        //Arrange 
        const mdp = 'ddoidfjdfdFDSFdsfDSFdfkodsfoùpdsfdsdspofidjfipd,fc';
        const nbSalt = 10;
        //Act
        const hashed = await bcrypt.hash(mdp, nbSalt);
        //Assert
        expect(hashed).not.toEqual(mdp);
    });

    it('2 Hashes from same pwd must be different', async () => {
        //Arrange 
        const mdp = 'ddoidfjdfdFDç§(!(§à§§(SFdsfDSFdfkodsfoùpdsfdsdspofidjfipd,fc';
        const nbSalt = 10;
        //Act
        const hashed1 = await bcrypt.hash(mdp, nbSalt);
        const hashed2 = await bcrypt.hash(mdp, nbSalt)
        //Assert 
        expect(hashed1).not.toEqual(hashed2);
    });
});

describe('UT-bcrypt COMPARE', () => {
    it('pwd is correct', async () => {
        //Arrange 
        const mdp = 'fdsfdsfjdsmonfdcezjnf';
        const nbSalt = 10;
        const hashed1 = await bcrypt.hash(mdp, nbSalt);
        //Act 
        const resultCompare = await bcrypt.compare(mdp, hashed1);
        //Assert 
        expect(resultCompare).toBeTruthy();
    });

    it('pwd is incorrect', async () => {
        //Arrange 
        const mdp = 'fdsfdsfjdsmonfdcezjnf';
        const mdpIncorrect = 'dsiofjdsfidsofjdsfiodsjf';
        const nbSalt = 10;
        const hashed = await bcrypt.hash(mdp, nbSalt);
        //Act 
        const resultCompare = await bcrypt.compare(mdpIncorrect, hashed);
        //Assert 
        expect(resultCompare).toBeFalsy();
    });

    it('hash is invalid', async () => {
        //Arrange 
        const mdp = 'fdsfdsfjdsmonfdcezjnf';
        const hash = 'dsiofjdsfidsofjdsfiodsjf';
        //Act 
        const resultCompare = await bcrypt.compare(mdp, hash);
        //Assert 
        expect(resultCompare).toBeFalsy();
    });
});
