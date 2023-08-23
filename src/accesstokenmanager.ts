// /*let accessToken = "";

// export const setAccessToken = (token: string) => {
//   accessToken = token;
// };

// export const getAccessToken = () => {
//   return accessToken;
// };*/

// export class accesstokengoogle {

    

//   public static accesstokenn() {
   

//  let accessToken = "";

//   const setAccessToken = (token: string) => {
//    accessToken = token;
//  };

//  const getAccessToken = () => {
//    return accessToken;
//  };
// }
// }
export class AccessTokenManager {
  private static accessToken: string = "";

  public static setAccessToken(token: string) {
    AccessTokenManager.accessToken = token;
  }

  public static getAccessToken() {
    return AccessTokenManager.accessToken;
  }
}
