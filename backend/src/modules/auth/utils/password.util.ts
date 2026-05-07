import * as bcrypt from 'bcrypt';


export class PasswordUtil {
    private static readonly DUMMY_HASH =
        '$2b$12$dummyHashForTimingAttackPreventionXXXXXXXXXXXXXXXXXXXXXX';


    static async compareConstantTime(
        password: string,
        hash: string | null,
    ): Promise<boolean> {
        const hashToCompare = hash || this.DUMMY_HASH;
        const isMatch = await bcrypt.compare(password, hashToCompare);

        return hash !== null && isMatch;
    }


    static async hash(password: string, rounds: number): Promise<string> {
        return bcrypt.hash(password, rounds);
    }
}