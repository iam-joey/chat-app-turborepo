import { atom, selector } from "recoil";
import axios from "axios";
const backendUrl = "http://localhost:3001/api/v1/me";

export const userAtom = atom({
  key: "user",
  default: selector({
    key: "user/me",
    get: async () => {
      try {
        const response = await axios.get(`${backendUrl}`, {
          withCredentials: true,
        });
        if (response.status === 201) {
          return response.data.data;
        }
      } catch (error) {
        console.log("error in store atoms", error);
      }
      return null;
    },
  }),
});
