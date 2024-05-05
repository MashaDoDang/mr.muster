import { mockUsers, mockGrids, mockComments } from "./mockFirebaseData";

export const mockFirestore = {
    collection: (collectionName) => {
      if (collectionName === "users") {
        return {
          doc: (userId) => ({
            get: () => Promise.resolve({
              data: () => mockUsers[userId],
            }),
          }),
        };
      }
      else if (collectionName === "grids") {
        return {
          doc: (gridId) => ({
            get: () => Promise.resolve({
              data: () => mockGrids[gridId],
            }),
          }),
        };
      }
      else if (collectionName === "comments") {
        return {
          doc: (commentId) => ({
            get: () => Promise.resolve({
              data: () => mockComments[commentId],
            }),
          }),
        };
      }
      // Handle other collections as needed
    },
};