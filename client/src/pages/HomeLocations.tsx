import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  IconButton,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { Location } from "../types/location";

interface Props {
  locales: Location[];
}

export default function HomeLocations({ locales }: Props) {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [imageIndex, setImageIndex] = useState<Record<number, number>>({});
  const [paused, setPaused] = useState(false);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 👇 INTERSECTION OBSERVER (animación al aparecer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2 }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));

    return () => observer.disconnect();
  }, [locales]);

  // 👇 INICIALIZAR ÍNDICES
  useEffect(() => {
    const initial: Record<number, number> = {};

    locales.forEach((l) => {
      initial[l.id] = 0;
    });

    setImageIndex(initial);
  }, [locales]);

  // 👇 AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      if (paused) return;

      setImageIndex((prev) => {
        const newIndexes = { ...prev };

        locales.forEach((local) => {
          if (local.images?.length > 1) {
            const current = newIndexes[local.id] ?? 0;
            newIndexes[local.id] =
              (current + 1) % local.images.length;
          }
        });

        return newIndexes;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [locales, paused]);

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, md: 4 },
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(auto-fit, minmax(220px, 1fr))",
          sm: "repeat(auto-fit, minmax(260px, 1fr))",
          md: "repeat(auto-fit, minmax(320px, 1fr))",
        },
        gap: 3,
      }}
    >
      {locales.map((local, index) => {
        const isVisible = visibleCards.includes(index);
        const fromLeft = index % 2 === 0;

        const currentIndex = imageIndex[local.id] ?? 0;

        return (
          <Card
            key={local.id}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            data-index={index}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            sx={{
              borderRadius: 3,
              backgroundColor: "#111",
              border: "1px solid rgba(255,255,255,0.06)",

              opacity: isVisible ? 1 : 0,
              transform: isVisible
                ? "translateX(0)"
                : fromLeft
                ? "translateX(-80px)"
                : "translateX(80px)",

              transition: "opacity 0.8s ease, transform 0.8s ease",

              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              },
            }}
          >
            <CardActionArea href="/login">
              {/* IMAGEN CARRUSEL */}
              <Box
            sx={{
                position: "relative",
                height: { xs: 180, sm: 220, md: 260 },
                overflow: "hidden",
            }}
            >
            {local.images?.map((img, i) => {
                const url = `${import.meta.env.VITE_API_URL}/uploads/location/${img}`;

                return (
                <Box
                    key={img}
                    component="img"
                    src={url}
                    alt={local.name}
                    loading="lazy"
                    sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",

                    opacity: i === currentIndex ? 1 : 0,
                    transition: "opacity 1.2s ease-in-out",

                    // 👇 leve brillo tipo hero
                    filter: i === currentIndex
                        ? "brightness(1)"
                        : "brightness(0.85)",
                    }}
                />
                );
            })}

            {/* 👇 overlay blanco animado tipo hero */}
            <Box
                sx={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.08)",
                opacity: 0,
                animation: "flash 1.2s ease",

                "@keyframes flash": {
                    "0%": { opacity: 0.25 },
                    "100%": { opacity: 0 },
                },
                }}
            />

            {/* overlay oscuro base */}
            <Box
                sx={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.25)",
                }}
            />
            </Box>

                
              {/* CONTENIDO */}
              <CardContent sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "Keania One",
                    color: "#DBD515",
                    fontSize: { xs: 16, md: 20 },
                  }}
                >
                  {local.name}
                </Typography>

                <Typography sx={{ color: "#bbb", fontSize: 14 }}>
                  {local.address}
                  {local.department
                    ? ", " + local.department
                    : ""}
                </Typography>

                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    const fullAddress = `${local.address}${
                      local.department
                        ? ", " + local.department
                        : ""
                    }`;

                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        fullAddress
                      )}`,
                      "_blank"
                    );
                  }}
                >
                  <LocationOnIcon sx={{ color: "#DBD515" }} />
                </IconButton>
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}