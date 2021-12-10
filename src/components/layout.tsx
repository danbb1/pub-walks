import * as React from 'react';

const Layout: React.FC = ({ children }) => {
  return (
    <>
      <div>
        <main>{children}</main>
      </div>
    </>
  );
};

export default Layout;
