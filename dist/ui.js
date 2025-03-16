/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*********************!*\
  !*** ./src/ui.html ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// Module
var code = `<!DOCTYPE html>
<html>
<head>
  <title>Simple Test UI</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 20px;
    }
    h1 {
      font-size: 16px;
      margin: 0 0 16px 0;
      color: var(--figma-color-text);
    }
    #status {
      margin-top: 16px;
      font-size: 14px;
      color: var(--figma-color-text);
    }
  </style>
  ${"<" + "script"}>
    console.log('UI script starting...');
    window.onload = () => {
      console.log('Window loaded');
      try {
        parent.postMessage({ 
          pluginMessage: { 
            type: 'log', 
            message: 'UI loaded successfully.' 
          } 
        }, '*');
        console.log('Initial message sent to plugin');
      } catch (error) {
        console.error('Error sending initial message:', error);
      }
    };

    window.onerror = (message, source, lineno, colno, error) => {
      console.error('UI Error:', {
        message,
        source,
        lineno,
        colno,
        error
      });
    };
  ${"<" + "/script"}>
</head>
<body>
  <h1>Hello from the UI!</h1>
  <div id="status"></div>
</body>
</html>`;
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (code);
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWkuanMiLCJtYXBwaW5ncyI6Ijs7VUFBQTtVQUNBOzs7OztXQ0RBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksZUFBZTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0EsSUFBSSxnQkFBZ0I7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBZSxJQUFJLEUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zaW1wbGUtdGVzdC1wbHVnaW4vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc2ltcGxlLXRlc3QtcGx1Z2luL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zaW1wbGUtdGVzdC1wbHVnaW4vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zaW1wbGUtdGVzdC1wbHVnaW4vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zaW1wbGUtdGVzdC1wbHVnaW4vLi9zcmMvdWkuaHRtbCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgcmVxdWlyZSBzY29wZVxudmFyIF9fd2VicGFja19yZXF1aXJlX18gPSB7fTtcblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIE1vZHVsZVxudmFyIGNvZGUgPSBgPCFET0NUWVBFIGh0bWw+XG48aHRtbD5cbjxoZWFkPlxuICA8dGl0bGU+U2ltcGxlIFRlc3QgVUk8L3RpdGxlPlxuICA8c3R5bGU+XG4gICAgYm9keSB7XG4gICAgICBmb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgc2Fucy1zZXJpZjtcbiAgICAgIG1hcmdpbjogMDtcbiAgICAgIHBhZGRpbmc6IDIwcHg7XG4gICAgfVxuICAgIGgxIHtcbiAgICAgIGZvbnQtc2l6ZTogMTZweDtcbiAgICAgIG1hcmdpbjogMCAwIDE2cHggMDtcbiAgICAgIGNvbG9yOiB2YXIoLS1maWdtYS1jb2xvci10ZXh0KTtcbiAgICB9XG4gICAgI3N0YXR1cyB7XG4gICAgICBtYXJnaW4tdG9wOiAxNnB4O1xuICAgICAgZm9udC1zaXplOiAxNHB4O1xuICAgICAgY29sb3I6IHZhcigtLWZpZ21hLWNvbG9yLXRleHQpO1xuICAgIH1cbiAgPC9zdHlsZT5cbiAgJHtcIjxcIiArIFwic2NyaXB0XCJ9PlxuICAgIGNvbnNvbGUubG9nKCdVSSBzY3JpcHQgc3RhcnRpbmcuLi4nKTtcbiAgICB3aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ1dpbmRvdyBsb2FkZWQnKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHBhcmVudC5wb3N0TWVzc2FnZSh7IFxuICAgICAgICAgIHBsdWdpbk1lc3NhZ2U6IHsgXG4gICAgICAgICAgICB0eXBlOiAnbG9nJywgXG4gICAgICAgICAgICBtZXNzYWdlOiAnVUkgbG9hZGVkIHN1Y2Nlc3NmdWxseS4nIFxuICAgICAgICAgIH0gXG4gICAgICAgIH0sICcqJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJbml0aWFsIG1lc3NhZ2Ugc2VudCB0byBwbHVnaW4nKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHNlbmRpbmcgaW5pdGlhbCBtZXNzYWdlOicsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgd2luZG93Lm9uZXJyb3IgPSAobWVzc2FnZSwgc291cmNlLCBsaW5lbm8sIGNvbG5vLCBlcnJvcikgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcignVUkgRXJyb3I6Jywge1xuICAgICAgICBtZXNzYWdlLFxuICAgICAgICBzb3VyY2UsXG4gICAgICAgIGxpbmVubyxcbiAgICAgICAgY29sbm8sXG4gICAgICAgIGVycm9yXG4gICAgICB9KTtcbiAgICB9O1xuICAke1wiPFwiICsgXCIvc2NyaXB0XCJ9PlxuPC9oZWFkPlxuPGJvZHk+XG4gIDxoMT5IZWxsbyBmcm9tIHRoZSBVSSE8L2gxPlxuICA8ZGl2IGlkPVwic3RhdHVzXCI+PC9kaXY+XG48L2JvZHk+XG48L2h0bWw+YDtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IGNvZGU7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9