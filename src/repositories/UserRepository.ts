import { GoogleUser } from '../Google'

export abstract class UserRepository<U> {
    abstract async getUserByGoogleUser(googleUser: GoogleUser): Promise<U>
}
