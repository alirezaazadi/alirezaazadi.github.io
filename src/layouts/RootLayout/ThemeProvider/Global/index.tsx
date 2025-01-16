import { css, Global as _Global, useTheme } from "@emotion/react"
import { vazirmatn } from "src/assets/fonts"

export const Global = () => {
  const theme = useTheme()

  return (
    <_Global
      styles={css`
          body {
              margin: 0;
              padding: 0;
              color: ${theme.colors.gray12};
              background-color: ${theme.colors.gray2};
              font-family: ${vazirmatn.style.fontFamily};
              font-weight: 400;
              font-style: normal;
          }

          * {
              color-scheme: ${theme.scheme};
              box-sizing: border-box;
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
              margin: 0;
              font-weight: inherit;
              font-style: inherit;
          }

          a {
              all: unset;
              cursor: pointer;
          }

          ul {
              padding: 0;
          }

          // init button

          button {
              all: unset;
              cursor: pointer;
          }

          // init input

          input {
              all: unset;
              box-sizing: border-box;
          }

          // init textarea

          textarea {
              border: none;
              background-color: transparent;
              font-family: inherit;
              padding: 0;
              outline: none;
              resize: none;
              color: inherit;
          }

          hr {
              width: 100%;
              border: none;
              margin: 0;
              border-top: 1px solid ${theme.colors.gray6};
          }
      `}
    />
  )
}
