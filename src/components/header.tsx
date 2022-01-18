import * as React from 'react';
import { Link } from 'gatsby';

const Header = ({ siteTitle }: { siteTitle: string }) => (
  <header>
    <div>
      <h1>
        <Link to="/">{siteTitle}</Link>
      </h1>
    </div>
  </header>
);

export default Header;
