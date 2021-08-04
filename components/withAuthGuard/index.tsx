import { useSession } from 'next-auth/client';
// import React, { useState } from 'react';
// export function withAuthGuard<P>(WrappedComponent: React.ComponentType<P>) {
//     const [session, loading] = useSession();
//     const ComponentWithParentProps = (props: P) => {
//         return !session && !loading<WrappedComponent {...props} />;
//     };
//     return ComponentWithParentProps;
// }