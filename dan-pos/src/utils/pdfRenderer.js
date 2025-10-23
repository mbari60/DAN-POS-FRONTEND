// utils/pdfRenderer.js
import React from 'react';
import ReactDOMServer from 'react-dom/server';

export const renderComponentToString = (Component, props) => {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(Component, props));
};
