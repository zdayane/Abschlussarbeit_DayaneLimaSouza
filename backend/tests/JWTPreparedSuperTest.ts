import supertest from "supertest";
import express from 'express';
import https from "https";
import { verifyPasswordAndCreateJWT } from "../src/services/AuthentificationService";

let jwtString: string;

/**
 * Erzeugt einen neuen JWT. Der JWT wird gespeichert und beim Aufruf von
 * {@link jwtSuperTest} verwendet, sofern dort kein neuer Token angegeben wird.
 * Zur Erzeugung des Tokens wird {@link verifyPasswordAndCreateJWT} vom AuthenticationService
 * verwendet.
 * Typischerweise wird dies in {@link jest.beforeAll} verwendet, etwa so:
 * ```
 * john = await createUser({ name: "John", email: "john@some-host.de", password: "123", admin: false })
   await prepareJWTAccessToken("john@some-host.de", "123")
 * ```
   Im eigentlichen Test wird dann {@link jwtSuperTest} verwendet.

 * @param secret optional, wird sonst auf "mysecret" gesetzt.
 */
export async function prepareJWTAccessToken(email: string, password: string, secret?: string) {
    process.env.JWT_SECRET = secret || "mysecret";
    const token = await verifyPasswordAndCreateJWT(email, password);
    if (!token) {
        throw Error("Log in failed, check email and password");
    }
    jwtString = token;
}

/**
 * Ersatz für {@link supertest}-Aufruf. Statt also
 * ```
 * const req = supertest(app);
 * ```
 * kann man hier
 * ```
 * const req = jwtSuperTest(app);
 * ```
 * aufrufen. Damit wird ein Request erzeugt, der beim Absenden einen Cookie mitbekommt.
 * Der Cookie enthält den jwtToken.
 * @param app Die Express app (oder ein https-Server)
 * @param tokenName Der Name des Tokens, default "access_token"
 * @param jwtToken Der Token mit dem JWT, optional falls zuvor {@link prepareJWTAccessToken} aufgerufen wurde.
 */
export function jwtSuperTest(app: express.Express|https.Server, tokenName = "access_token", jwtToken?: string): JWTPreparedSuperTest {
    return new JWTPreparedSuperTest(app, tokenName, jwtToken);
}

class JWTPreparedSuperTest {
    
    private req: supertest.SuperTest<supertest.Test>;
    private tokenName: string;
    private jwtToken: string;

    constructor(app: express.Express|https.Server, tokenName = "access_token", jwtToken?: string) {
        this.req = supertest(app);
        this.tokenName = tokenName;
        if (!jwtToken) {
            if (!jwtString) {
                throw Error("JWT not prepared, call prepareJWTAccessToken before or pass your own token");
            }
            this.jwtToken = jwtString;
        } else {
            this.jwtToken = jwtToken;
        }
    }
    delete(url: string): supertest.Test {
        return this.addJWTAccessToken(this.req.delete(url));
    }
    get(url: string): supertest.Test {
        return this.addJWTAccessToken(this.req.get(url));
    }
    patch(url: string): supertest.Test {
        return this.addJWTAccessToken(this.req.patch(url));
    }
    post(url: string): supertest.Test {
        return this.addJWTAccessToken(this.req.post(url));
    }
    put(url: string): supertest.Test {
        return this.addJWTAccessToken(this.req.put(url));
    }

    private addJWTAccessToken(req: supertest.Test) {
        return req.set('Cookie', [`${this.tokenName}=${this.jwtToken};HttpOnly`]);
    }
    
}
