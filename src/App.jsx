// src/App.jsx
import CombinedTimeline from "./combined/combinedTimeline.jsx";
import "./combinedStyles/base.css";
import { Container } from '@mantine/core';
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '74em',
    xl: '90em',
  },
});

const AppProviders = ({ children }) => (
  <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>  
      {children}
  </MantineProvider>
);

export default function App() {

  return (
    <AppProviders>
      <Container fluid p="md">
        <CombinedTimeline />
      </Container>
    </AppProviders>
  );
}
