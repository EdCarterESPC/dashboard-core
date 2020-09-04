/**
 * this enumeration contains all the object types that a user can have privileged access to,
 * used in testing 
 */

export enum AuthObject {

    Firm = 'firm',
    Branch = 'branch',
    Property = 'property',

    File = 'file',

    User = 'user',
    Authentication = 'auth',

    Role = 'role',
    Permission = 'permission',
    Grant = 'grant'

}