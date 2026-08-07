export const frontendUrlFunction = () => {
  const frontendUrl = "https://rent-nest-delta.vercel.app";
  //   const frontendUrl = "http://localhost:3000";
  return frontendUrl;
};

export const backendUrlFunction = () => {
  const backendUrl = "https://rent-nest-delta.vercel.app";
  // const backendUrl = "http://localhost:5000";
  return backendUrl;
};


// const rawBackendDomain =
//   process.env.VERCEL_PROJECT_PRODUCTION_URL ||
//   process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;

// export const BACKEND_URL = () => {
//   const productionurl = rawBackendDomain
//     ? `https://${rawBackendDomain}`
//     : "https://rent-nest-delta.vercel.app";

    //  const productionurl = "http://localhost:5000";
//   return productionurl;
// };