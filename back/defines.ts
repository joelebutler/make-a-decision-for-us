import type { ResponseFactor } from "@shared/shared-types";

export const USER_DB: string = "users";
export const ROOM_DB: string = "rooms";

const exampleResponse: RESPONSE_TYPE = {
  title: "Title describing the returned item.",
  description:
    "A detailed description of why this option is a good fit, outlining its pros and cons based on the factors.",
  factors: [
    {
      factorId: "factor_id_1",
      matchPercent: 0,
    },
    {
      factorId: "factor_id_2",
      matchPercent: 50,
    },
    {
      factorId: "factor_id_3",
      matchPercent: 100,
    },
  ],
};

export const SYSTEM_INSTRUCTIONS: string = `We will be sending a description of a problem with several factors to consider. Each factor will be weighted differently based on its value. A higher weight means that it is more important to the decision; an option that has more towards the higher weighted items will be considered a better option. We are expecting exactly 3 options as a result. Return the result as a raw JSON array containing exactly 3 objects. Be more restrictive with your ratings, and return a spread with some variance, but not no influence in a direction unless it is very highly downvoted. Each object should be in the format of ${JSON.stringify(exampleResponse)}. Do not include markdown formatting like \`\`\`json or \`\`\`. Just return the raw JSON array.`;

export type RESPONSE_TYPE = {
  title: string;
  description: string;
  factors: ResponseFactor[];
};
