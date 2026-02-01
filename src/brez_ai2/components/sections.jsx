import React from "react";
import "../styles/timeline.css";
import FullscreenLottie from "./meteor.jsx";
import { addTooltip } from "./addTooltip.jsx";
import BottomTimeline from "./BottomTimeline.jsx";
import ImagePortal from "./imagePortal.jsx";
import { Box, Flex, Stack, Title, Text } from "@mantine/core";

export const sections = [
  { id: 0, title: "Osončje",
    content: "To interaktivno orodje vsebuje različne vsebine, besedila in namige. Za dodatne informacije premakni miško nad oranžno besedo.",
  },
  { id: 1, title: "Nastanek Sonca",
     content: "Sonce je nastalo iz ogromnega oblaka plina in prahu – kondenzirani material se je sesedel v jedro, kjer je prišlo do termonuklearne fuzije in postalo je zvezda!", era: "4,6 milijarde let nazaj", image: "https://images.stockcake.com/public/f/9/1/f915fff9-c55a-40e4-9e5f-92ce289ebfa2_large/stellar-nebula-brilliance-stockcake.jpg" },
  { id: 2, title: "Nastanek planetov",
     content: "Okoli nastajajočega Sonca se je iz ostankov oblaka oblikoval disk - iz drobcev prahu in plina so se skozi gravitacijsko združevanje postopoma oblikovali planetarni embriji, ki so prerasli v planete, tudi Zemljo.", era: "4,5 milijarde let nazaj", image: "https://supernova.eso.org/static/archives/exhibitionimages/screen/0507_C_planet-formation.jpg" },
  { id: 3, title: "Nastanek Lune", 
    content: "V Zemljo je trčil planetarni objekt velikosti Marsa, znan kot Theia. Ta silovit trk je izstrelil ogromno količino materiala v Zemljino orbito, kjer so se delci zaradi gravitacije sčasoma združili v Luno. Luna je tako postala najbližji spremljevalec Zemlje in ima ključno vlogo pri plimovanju ter stabilnosti Zemljine osi.", era: "4,45 milijarde let nazaj", image: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/lunar-science/internal_resources/585/Moon_formation_illustration.jpeg?w=576&h=461&fit=clip&crop=faces%2Cfocalpoint" },
  { id: 4, title: "Pozno obdobje težkega bombardiranja", 
    content: "Takrat se je Osončje soočilo z obdobjem, v katerem so asteroidi in kometi množično trkali v planete in njihove lune. Ti trki so preoblikovali površine nebesnih teles, ustvarjali kraterje in morda celo prinesli vodo ter organske spojine na Zemljo morda celo prinesli vodo ter organske spojine na Zemljo. S tem so morda prispevali k nastanku življenja.", era: "4 milijarde let nazaj", image: "https://scx2.b-cdn.net/gfx/news/2016/lateheavybom.jpg" },
  { id: 5, title: "Stabilno Osončje", 
    content: "Po koncu silovitih trkov in oblikovanja planetov je Osončje vstopilo v dolgotrajno obdobje stabilnosti. Planeti, lune in drugi objekti sedaj mirno krožijo po svojih orbitah okoli Sonca, kar omogoča razmere za življenje na Zemlji.", era: "Zadnjih 3 milijarde let", image: "https://c02.purpledshub.com/uploads/sites/41/2019/10/GettyImages-460712793-769fd3a.jpg" },
  { id: 6, title: "Rdeča orjakinja", 
    content: "Čez približno 5 milijard let bo Sonce na koncu svojega vodikovega goriva – zvezda se bo razširila v rdečo orjakinjo in pogoltnila notranje planete, morda tudi Zemljo!", era: "Čez 5 milijard let", image: "https://theplanets.org/123/2021/05/red-giant-star.png" },
  { id: 7, title: "Nastanek planetarne meglice", 
    content: "Ko bo Sonce raztegnilo zunanje plasti, jih bo odvrglo v vesolje in v središču bo ostala vroča, kompaktna bela pritlikavka, obdana z barvami planetarne meglice.", era: "Čez 5,4 milijarde let", image: "https://dq0hsqwjhea1.cloudfront.net/cats_eye_NGC6543_480px.jpg" },
  { id: 8, title: "Bela pritlikavka", 
    content: "Po tem, ko bo Sonce odvrglo svoje zunanje plasti, bo ostalo le še majhno, vroče jedro brez goriva – bela pritlikavka. Glavni vir svetlobe in toplote v Osončju bo postopoma pojenjal...", era: "Čez 6 milijard let", image: "https://dq0hsqwjhea1.cloudfront.net/WhiteDwarf-1440x1060pixels.original-815x600.jpg" },
  { id: 9, title: "Konec svetlosti Osončja", 
    content: "Sčasoma se bo bela pritlikavka popolnoma ohladila in postala temna, hladna masa brez svetlobe in toplote: črna pritlikavka. Brez Sončeve energije bodo planeti zamrznili, in življenje, če bo še obstajalo bo dokončno izginilo. To bo miren, a neizbežen konec našega Osončja.", era: "Čez trilijone let", image: "https://cdn.i-scmp.com/sites/default/files/styles/1200x800/public/2015/10/22/death_star_ny570_53470649.jpg?itok=dAfUTDnW" },
  { id: 10, title: "Konec tega dela", 
    content: "Nadaljuj na vprašalnik." }
];


function LandingSection({ title, content, onStart, project, pushEvent }) {
  return (
    <Box className="timeline-landing">
      <Flex
        w="100%"
        h="100dvh"
        align="center"
        justify={{ base: "center", md: "flex-end" }}   // to right side
        px={{ base: "md", sm: "xl", md: "3rem", lg: "5rem", xl: "7rem" }}
      >
        <Stack
          align={{ base: "center", md: "flex-start" }} 
          gap="xl"
          maw={460}
          w="100%"
          mr={{ base: 0, md: "3vw", lg: "5vw" }}       
          style={{ position: "relative", zIndex: 1 }}
        >
          <Title
            order={1}
            fz={{ base: 52, sm: 60, md: 72, lg: 80 }}
            ta={{ base: "center", md: "center" }}
          >
            {title}
          </Title>

          <Text
            fz={{ base: 23, sm: 25, md: 30 }}
            ta={{ base: "center", md: "center" }}
          >
          {addTooltip(content, { project, sectionIndex: 0, pushEvent })} 
          </Text>

           <button
            type="button"
            className="start-button"
            onClick={onStart}
          >
            Gremo!
          </button>
        </Stack>
      </Flex>
    </Box>
  );
}

export function Sections({ currentIndex, goBack, goNext, setCurrentIndex, project, pushEvent }) {
  const current = sections[currentIndex];

  const BottomBar = (
  <BottomTimeline
    project={project}
    currentIndex={currentIndex}
    onSelectSection={(sectionIdx) => setCurrentIndex(sectionIdx)}
    pushEvent={pushEvent}
  />
);


  // Landing (0)
  if (currentIndex === 0) {
    return (
      <LandingSection
        title={current.title}
        content={current.content}
        onStart={goNext}
        project={project}
        pushEvent={pushEvent}
      />
    );
  }

  // Sections 1–9
  if (currentIndex >= 1 && currentIndex <= 9) {
  const isLastContent = current.id === 9;

  return (
    <Box className="timeline-grid">
      {currentIndex === 4 && <FullscreenLottie />}

      <div className="top-bar">
        <h2>{current.title}</h2>
        {current.era && <h3>{current.era}</h3>}
      </div>

      <Flex
        className="section-layout"
        direction="column"
        gap="xl"
      >
        <Flex
          className="section-main-row"
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
          justify="space-between"
          gap="xl"
        >
          <Box className="nav-desktop nav-desktop--left">
            {currentIndex > 1 && (
              <button className="nav-btn" onClick={goBack}>
                Nazaj
              </button>
            )}
          </Box>

          <Box className="section-image">
            {current.image ? (
              <ImagePortal src={current.image} alt={current.title} />
            ) : (
              <div className="animation-placeholder">Ni slike</div>
            )}
          </Box>

          <Box className="section-text">
            <div className="text-content">
              {addTooltip(current.content, { project, sectionIndex: currentIndex, pushEvent })}
            </div>
          </Box>

          <Box className="nav-desktop nav-desktop--right">
            <button
              className="nav-btn"
              onClick={isLastContent ? () => setCurrentIndex(10) : goNext}
            >
              {isLastContent ? "Konec" : "Naprej"}
            </button>
          </Box>
        </Flex>

        <Flex
          className="nav-row-mobile"
          mt="md"
          gap="md"
          justify="space-between"
        >
          {currentIndex > 1 && (
            <button className="nav-btn" onClick={goBack}>
              Nazaj
            </button>
          )}
          <button
            className="nav-btn"
            onClick={isLastContent ? () => setCurrentIndex(10) : goNext}
          >
            {isLastContent ? "Konec" : "Naprej"}
          </button>
        </Flex>
      </Flex>

      {BottomBar}
    </Box>
  );
}

  // Section 10
  if (currentIndex === 10) {
    return (
      <div
        className="timeline-container"
        style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}
      >
        <div style={{ maxWidth: 720, padding: 24, textAlign: "center" }}>
          <h1 style={{ marginTop: 0 }}>{current.title}</h1>
          <p style={{ fontSize: "1.5rem" }}>{current.content}</p>
          <button
            onClick={() => setCurrentIndex(11)}
            style={{ marginTop: 16, fontSize: "1.2rem", padding: "8px 16px" }}
          >
            Naprej
          </button>
        </div>
      </div>
    );
  }

  return null;
}
