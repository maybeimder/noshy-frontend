// Pictograms for food, drawn on a 24 grid: `d` is stroked, `f` is filled (leaves, pits, drops).
type Glyph = { d: string; f?: string };

export const foodGlyphs = {
      // Fruit
      apple: { d: "M12 20.9c1.5 0 2.7 1.1 4 1.1 3 0 6-8 6-12.200A4.900 4.900 0 0 0 17 5c-2.200 0-4 1.400-5 2-1-.6-2.800-2-5-2a4.900 4.900 0 0 0-5 4.800C2 14 5 22 8 22c1.300 0 2.500-1.100 4-1.100ZM10 2c1 .5 2 2 2 5" },
      banana: { d: "M4 13c3.500-2 8-2 10 2a5.500 5.500 0 0 1 8 5M5.150 17.890c5.520-1.520 8.650-6.890 7-12C11.550 4 11.500 2 13 2c3.220 0 5 5.500 5 8 0 6.500-4.200 12-10.490 12C5.110 22 2 22 2 20c0-1.500 1.140-1.550 3.150-2.110Z" },
      citrus: { d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 18.500a6.500 6.500 0 1 0 0-13 6.500 6.500 0 0 0 0 13ZM12 5.500v13M6.400 8.750l11.200 6.500M17.600 8.750l-11.200 6.500" },
      strawberry: { d: "M12 8c4.500-1 7 1 6.500 4.500C18 16 14.500 20 12 21.500 9.500 20 6 16 5.500 12.500 5 9 7.500 7 12 8ZM9 12h.01M12 14.500h.01M15 12h.01M10.500 17.200h.01M13.500 17.200h.01", f: "M12 8.600C10 9 8 8.200 7.300 6.200c1.600-.5 2.700-.2 3.400.5L12 3l1.300 3.700c.7-.7 1.800-1 3.400-.5C16 8.200 14 9 12 8.600Z" },
      grape: { d: "M8.500 10.500a2.100 2.100 0 1 0 0-4.200 2.100 2.100 0 0 0 0 4.200ZM15.500 10.500a2.100 2.100 0 1 0 0-4.200 2.100 2.100 0 0 0 0 4.200ZM12 12.400a2.100 2.100 0 1 0 0-4.200 2.100 2.100 0 0 0 0 4.200ZM9 16.300a2.100 2.100 0 1 0 0-4.200 2.100 2.100 0 0 0 0 4.200ZM15 16.300a2.100 2.100 0 1 0 0-4.200 2.100 2.100 0 0 0 0 4.200ZM12 20.500a2.100 2.100 0 1 0 0-4.200 2.100 2.100 0 0 0 0 4.200ZM12 8.200V3c1.500-.8 3-.7 4.200.2" },
      pineapple: { d: "M12 22c3.300 0 5.500-2.700 5.500-6.500S15.300 9 12 9s-5.500 2.700-5.500 6.500S8.700 22 12 22ZM8 11.500l7.500 8M6.800 15.500l4.600 5.900M16 11.500l-7.500 8M17.200 15.500l-4.600 5.900", f: "M12 9.500 7.500 6.500l2.600.2L9 3l2.300 1.800L12 1.500l.7 3.300L15 3l-1.100 3.700 2.600-.2Z" },
      mango: { d: "M17.500 5.500c3 3 3.300 8.400 0 12.200-3.500 4-10 4.300-12.700 1.300-2.600-2.900-1-7 2.700-8.600 2.600-1.100 3.300-2.300 4.600-3.900 1.500-1.900 3.800-2.400 5.400-1ZM16.500 5c0-1 .6-2 1.700-2.500M17 10.500c.3 2-.4 4-1.800 5.500" },
      watermelon: { d: "M2.500 8.500h19a9.500 9.500 0 0 1-19 0ZM6 8.500a6 6 0 0 0 12 0M10 10.500h.01M12 12.300h.01M14 10.500h.01" },
      avocado: { d: "M12 2.500c2.500 0 3.700 2.200 4.300 4.700.6 2.300 2.700 4 2.700 7.600A7 7 0 0 1 12 22a7 7 0 0 1-7-7.200c0-3.600 2.100-5.300 2.700-7.600C8.300 4.700 9.500 2.500 12 2.500Z", f: "M12 18.400a3.400 3.400 0 1 0 0-6.800 3.400 3.400 0 0 0 0 6.800Z" },
      coconut: { d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 17.500a5.500 5.500 0 1 0 0-11 5.500 5.500 0 0 0 0 11ZM9.500 11.500c.4-1.300 1.300-2 2.600-2.100" },
      pear: { d: "M12 6c2 0 3 1.600 3.200 3.400.3 2 2.800 3 2.800 6.400 0 3.500-2.600 5.700-6 5.700s-6-2.200-6-5.700c0-3.400 2.500-4.400 2.800-6.400C9 7.600 10 6 12 6ZM12 6c0-1.600.4-2.700 1.400-3.500", f: "M13.500 5c1.100-1.500 2.800-2 4.500-1.500-.7 1.700-2.500 2.500-4.500 1.500Z" },
      cherry: { d: "M2 17a5 5 0 0 0 10 0c0-2.760-2.500-5-5-3-2.500-2-5 .24-5 3ZM12 17a5 5 0 0 0 10 0c0-2.760-2.500-5-5-3-2.500-2-5 .24-5 3ZM7 14c3.220-2.910 4.290-8.750 5-12 1.660 2.380 4.940 9 5 12M22 9c-4.290 0-7.140-2.330-10-7 5.710 0 10 4.670 10 7Z" },
      // Vegetables
      tomato: { d: "M12 8c-5 0-8.500 2.600-8.500 6.500S7 21 12 21s8.500-2.600 8.500-6.500S17 8 12 8ZM7 13c-.5 1.500-.2 3 .9 4.200", f: "M12 8.800 8 10.500l1.500-2.600L7 6.200l3.300.2L12 3.500l1.300 2.900 3.600-.4-2.400 2 1.500 2.500Z" },
      carrot: { d: "M2.270 21.700s9.870-3.500 12.730-6.360a4.500 4.500 0 0 0-6.360-6.370C5.770 11.840 2.270 21.700 2.270 21.700ZM8.640 14l-2.050-2.040M15.340 15l-2.460-2.460M22 9s-1.330-2-3.500-2C16.860 7 15 9 15 9s1.330 2 3.500 2S22 9 22 9ZM15 2s-2 1.330-2 3.500S15 9 15 9s2-1.840 2-3.500C17 3.330 15 2 15 2Z" },
      potato: { d: "M8 4.500c4-2.300 9.500-1 11.500 3.200 2 4.300.4 9.300-3.600 11.600-4 2.200-9.600 1.200-11.600-3-2-4.100-.3-9.500 3.700-11.800ZM9 9h.01M14.500 8h.01M12 13h.01M16 13.500h.01M9.500 16.500h.01" },
      onion: { d: "M12 4c-.3 2.200-1.200 3.300-3.200 4.300C5.900 9.800 4 11.900 4 14.500 4 18 7.500 20.500 12 20.500s8-2.500 8-6c0-2.600-1.900-4.700-4.800-6.200C13.200 7.300 12.300 6.200 12 4ZM12 4V2M12 8c-2.700 2-4 4-4 6.700 0 2.400 1.500 4.400 4 5.800M12 8c2.700 2 4 4 4 6.700 0 2.400-1.500 4.400-4 5.800" },
      garlic: { d: "M12 3c0 2.500-1.500 4-3.500 5.500S5 12 5 14.700C5 18 8 20.500 12 20.500s7-2.500 7-5.800c0-2.700-1.500-4.700-3.500-6.200S12 5.500 12 3ZM10.500 10c-1.500 2-2 4-2 5.700 0 1.700.5 3 1.500 4.500M13.500 10c1.500 2 2 4 2 5.700 0 1.700-.5 3-1.500 4.500M10 22.500h4" },
      cucumber: { d: "M5 19c-2.500-2.500-2-5.500 1-8.500l4.500-4.500c3-3 6-3.500 8.500-1s2 5.500-1 8.500L13.500 18c-3 3-6 3.500-8.500 1ZM8 14h.01M11 11h.01M14 8h.01M10.500 16h.01M13.500 13h.01M16.500 10h.01" },
      bellPepper: { d: "M12 8c2-2 6.500-1.500 7.500 2 1 3.700-1.300 10.500-4.300 11-1.300.2-1.900-.7-3.200-.7s-1.900.9-3.200.7c-3-.5-5.300-7.300-4.300-11C5.500 6.500 10 6 12 8ZM12 8c0 4-.5 7-1.200 8.500M12 8c0-2.200.6-4 2.500-5" },
      chili: { d: "M18 7.500c1 5-2.500 11-9 12.800-2 .6-4.200.6-6 .2 5-1.500 8-5 9-10.500.5-2.600 1.600-4 3.400-4 1.500 0 2.400.6 2.600 1.500ZM15.500 6c.2-1.600 1.200-2.800 3-3" },
      corn: { d: "M12 2.500c3 0 4.500 4 4.500 8.500s-1.500 8.500-4.500 8.500-4.500-4-4.500-8.500 1.500-8.500 4.500-8.500ZM12 3v10M8.300 7.500h7.400M7.600 11.500h8.800M7.500 12.500C5 13.500 4 17 4.500 21c3.500.5 6.300-.2 7.500-2M16.500 12.500c2.500 1 3.500 4.500 3 8.500-3.500.5-6.300-.2-7.500-2" },
      broccoli: { d: "M9 13c-3 .6-5.500-1-5.500-3.500C3.500 7.500 5 6 7 6c.3-2 2.200-3.500 5-3.500S16.700 4 17 6c2 0 3.500 1.500 3.500 3.500 0 2.500-2.500 4.100-5.500 3.500M9 13l1.500 3v5h3v-5l1.500-3M9 13c.8-1 1.900-1 3 0 1.100-1 2.200-1 3 0M12 13v3" },
      leafy: { d: "M12 21c-5 0-8-3-8-7.500 0-2 .8-3.600 2-4.700C6 6 7.500 4 9.500 4c.8-1 1.700-1.500 2.500-1.500s1.700.5 2.500 1.500c2 0 3.500 2 3.500 4.800 1.200 1.100 2 2.700 2 4.700 0 4.500-3 7.500-8 7.500ZM12 21V8M12 13l-3-2.500M12 13l3-2.500M12 17l-3.500-2.500M12 17l3.500-2.500" },
      herb: { d: "M4.500 21.500C8 17 11 13.500 17 10M9 17c-2.700.4-4.700-1-5.200-3.800 2.900-.3 4.900.9 5.200 3.800ZM13 13c-2.500-.8-3.700-2.900-3.100-5.700 2.700.8 3.900 2.800 3.100 5.700ZM17 10c-.8-2.700.3-5.100 3-6.500 1.200 2.800.1 5.200-3 6.500ZM13 15.500c1.700-2.200 4.100-2.600 6.500-1.200-1.500 2.400-3.900 2.900-6.500 1.200ZM9 19.500c1.700-1.700 3.800-1.800 5.700-.3-1.700 2-3.800 2.100-5.700.3Z" },
      mushroom: { d: "M3.500 12c0-5 3.800-8.500 8.500-8.500s8.500 3.500 8.500 8.500c0 1.200-.8 1.800-2 1.800h-13c-1.200 0-2-.6-2-1.800ZM9.500 13.800c.3 2.200 0 4-.7 5.600-.4 1 .3 2.100 1.400 2.100h3.600c1.100 0 1.800-1.100 1.400-2.100-.7-1.600-1-3.400-.7-5.600M9 8.500h.01M13.500 7h.01M16 10.500h.01" },
      eggplant: { d: "M15.800 8.200c2.300 2.300 2 6-.7 9-3 3.400-7.500 4.600-10.100 2.600-2.500-1.900-2.300-5.400.3-7.300 2.100-1.600 3.900-1.500 5.200-3.400 1.300-1.800 3.600-2.600 5.300-.9ZM11 8.500c.8-1.600 2.300-2.300 4-1.800.2 1.800 1.200 3 2.800 3.300M16 6.800c.3-1.700 1.400-3 3.200-3.600" },
      pumpkin: { d: "M12 8c-1.200-1-3-.9-4 .2-2.800-.4-5 2-5 5.600S5.300 20 8 20c1 .7 2.900.7 4 0 1.100.7 3 .7 4 0 2.700 0 5-2.600 5-6.200s-2.200-6-5-5.600c-1-1.100-2.800-1.200-4-.2ZM12 8c0-2 .8-3.500 2.500-4.200M8.500 8.500c-1.300 3.500-1.300 7.800 0 11M15.500 8.500c1.300 3.500 1.300 7.800 0 11" },
      beans: { d: "M3.800 17.500C3 11.500 7 5 15 4c2.500-.3 4.200.4 4.700 2C21 12 16 20 8 20.500c-2.500.1-4-1-4.200-3ZM8 17.600a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 13.800a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM15.800 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" },
      // Protein
      steak: { d: "M16.400 13.700A6.500 6.500 0 1 0 6.280 6.600c-1.100 3.130-.780 3.900-3.180 6.080A3 3 0 0 0 5 18c4 0 8.400-1.800 11.400-4.300M18.500 6l2.190 4.500a6.480 6.480 0 0 1-2.290 7.200C15.400 20.200 11 22 7 22a3 3 0 0 1-2.680-1.660L2.400 16.500M12.500 11a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z" },
      ham: { d: "M13.144 21.144A7.274 10.445 45 1 0 2.856 10.856M13.144 21.144A7.274 4.365 45 0 0 2.856 10.856a7.274 4.365 45 0 0 10.288 10.288M16.565 10.435 18.600 8.400a2.501 2.501 0 1 0 1.650-4.650 2.500 2.500 0 1 0-4.660 1.660l-2.024 2.025" },
      sausage: { d: "M5.500 8.500c1.500 6 5 9 11 10 2 .3 3.500-1 3.800-2.600.3-1.700-.8-3.200-2.700-3.500-3.700-.7-5.600-2.500-6.500-6C10.600 4.500 9 3.500 7.400 4c-1.600.4-2.500 2-1.900 4.500ZM4.500 2.500 6 4.500M22 20l-2.200-2" },
      bacon: { d: "M4 6.500c3-2.500 5 2.500 8 0s5 2.500 8 0v4c-3 2.500-5-2.500-8 0s-5-2.500-8 0ZM4 14.500c3-2.500 5 2.500 8 0s5 2.500 8 0v4c-3 2.500-5-2.500-8 0s-5-2.500-8 0Z" },
      drumstick: { d: "M9 15.800l-3.200 2.800c-1-.6-2.300-.4-2.700.6-.4 1 .3 1.800 1.200 1.900.1 1 .9 1.600 1.800 1.200 1-.4 1.200-1.700.6-2.700l2.900-3", f: "M13.500 4.700c2.700-2 6.200-1.600 7.700.7 1.900 2.900 1 7.600-2.500 9.900-2.600 1.700-5 1.200-6.900 1.600-.8.200-1.500.6-2.300 1.200l-2.800-2.800c.7-.8 1.100-1.500 1.200-2.300.4-2.400 2.600-6.100 5.600-8.300Z" },
      fish: { d: "M6.500 12c.94-3.460 4.940-6 8.500-6 3.560 0 6.060 2.540 7 6-.94 3.470-3.440 6-7 6s-7.560-2.530-8.500-6ZM18 12v.5M16 17.930a9.770 9.770 0 0 1 0-11.860M7 10.670C7 8 5.580 5.970 2.730 5.500c-1 1.500-1 5 .23 6.500-1.240 1.500-1.240 5-.23 6.500C5.580 18.030 7 16 7 13.330" },
      shrimp: { d: "M20 8.500C18.700 5.800 15.600 4 12 4a8 8 0 0 0 0 16h2.500M20 8.500h-8a3.500 3.500 0 0 0 0 7h1.500M20 8.500l1.500-4M17.500 6.200l1.200-3.700M14.500 20c2.300.2 4.300-1.200 4.800-3.500-2.600-.4-4.500.9-4.800 3.500ZM9 4.700l1.300 4.200M4.700 9.500l4.300 1.300M4.600 15l4.100-1.700M8 19l2.200-3.600M15 6.800h.01" },
      egg: { d: "M12 3c3.500 0 6.500 5 6.500 10a6.500 6.500 0 0 1-13 0C5.500 8 8.500 3 12 3ZM8.800 12c.2-2 .9-3.700 2-4.800" },
      tofu: { d: "M4 8.500 12 4l8 4.500v7L12 20l-8-4.500ZM4 8.500l8 4.500 8-4.500M12 13v7" },
      // Dairy
      cheese: { d: "M2.500 12.500 14 4.500c4 .5 7 3.500 7.500 8M2.500 12.500h19V19h-19ZM8 16h.01M13 15.500h.01M17.500 16.500h.01M14 9.500h.01" },
      butter: { d: "M6 14.500v-6h12v6M10 8.500v6M3 14.500h18c0 2.500-1.500 4-4 4H7c-2.500 0-4-1.500-4-4Z" },
      milk: { d: "M8 2.500h8v3.500l2.500 4v11.500h-13V10L8 6ZM8 6h8M5.500 10h13M9.500 15.500c1.700-1.200 3.300 1.200 5 0" },
      yogurt: { d: "M5.500 8h13l-1.400 12.500H6.900ZM4.500 5h15v3h-15ZM9 14c2-1.400 4 1.400 6 0" },
      iceCream: { d: "m7 11 4.080 10.350a1 1 0 0 0 1.840 0L17 11M17 7A5 5 0 0 0 7 7M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4" },
      // Grains and bakery
      rice: { d: "M3 11.500h18c0 4-2 7-5 8.500H8c-3-1.500-5-4.500-5-8.500ZM5 11.500C5 8 8 5 12 5s7 3 7 6.500M9 8.800h.01M12 7.500h.01M15 9h.01M12 10h.01" },
      pasta: { d: "M3 13h18c0 3.500-1.800 6-4.500 7.500h-9C4.800 19 3 16.500 3 13ZM6 13c0-2.200 1.600-3.500 3.500-3.500S13 10.800 13 13M11 13c0-2.200 1.600-3.500 3.500-3.500S18 10.800 18 13M12 9.500V3M10 3v2.500a2 2 0 0 0 4 0V3" },
      flour: { d: "M7 3h10l-1 3.500 2 3V20a1.500 1.500 0 0 1-1.500 1.500h-9A1.500 1.500 0 0 1 6 20V9.500l2-3ZM8 6.500h8M12 18.500v-4M12 15c-1.800 0-2.700-1-2.700-2.700 1.800 0 2.700 1 2.700 2.700ZM12 15c1.800 0 2.700-1 2.700-2.700-1.800 0-2.700 1-2.700 2.700Z" },
      wheat: { d: "M12 22V9M12 9c-1.600-1.600-1.600-4.200 0-6 1.600 1.800 1.600 4.400 0 6ZM12 13.500c-2.300 0-3.800-1.500-3.800-3.800 2.300 0 3.800 1.500 3.800 3.800ZM12 13.500c2.300 0 3.800-1.500 3.800-3.800-2.300 0-3.800 1.500-3.800 3.800ZM12 18c-2.300 0-3.800-1.500-3.800-3.800 2.300 0 3.800 1.500 3.800 3.800ZM12 18c2.300 0 3.800-1.500 3.800-3.800-2.300 0-3.800 1.500-3.800 3.800Z" },
      cereal: { d: "M3 11h18a9 9 0 0 1-5 8.500H8A9 9 0 0 1 3 11ZM8 8a1.700 1.700 0 1 0 0-3.400A1.700 1.700 0 0 0 8 8ZM13 7a1.700 1.700 0 1 0 0-3.400A1.700 1.700 0 0 0 13 7ZM17 9a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3Z" },
      bread: { d: "M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 1 7.900V19a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-5.100A4 4 0 0 1 4 10ZM10 9.500v2M14 9.500v2" },
      arepa: { d: "M12 19c5 0 9-2.700 9-6.500S17 6 12 6s-9 2.700-9 6.500S7 19 12 19ZM6.500 11l2 2M11 9l1.500 2M15.500 10l1.500 2M9.500 14.500 11 16M14 13.500l1.500 1.500" },
      taco: { d: "M3 16.500a9 9 0 0 1 18 0c0 1.200-.8 2-2 2H5c-1.200 0-2-.8-2-2ZM4.200 11.500c.3-2 1.700-3 3.300-2.500.5-2 2-3 3.800-2.500 1.500-1.400 3.500-1.200 4.700.4 1.800 0 3.300 1.500 3.500 4M9 14h.01M12.500 12h.01M15.500 14.500h.01" },
      cookie: { d: "M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5M8.500 8.500v.01M16 15.500v.01M12 12v.01M11 17v.01M7 14v.01" },
      cake: { d: "M4 20.500h16M5 20.500V13a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7.500M5 15.500c1.200 1 2.300 1 3.500 0s2.300-1 3.500 0 2.300 1 3.500 0 2.300-1 3.500 0M12 11V7.500M12 4.500v.01" },
      pizza: { d: "m12 14-1 1M13.750 18.250l-1.250 1.420M17.775 5.654a15.680 15.680 0 0 0-12.121 12.120M18.800 9.300a1 1 0 0 0 2.100 7.700M21.964 20.732a1 1 0 0 1-1.232 1.232l-18-5a1 1 0 0 1-.695-1.232A19.680 19.680 0 0 1 15.732 2.037a1 1 0 0 1 1.232.695ZM8 14h.01" },
      // Pantry
      oil: { d: "M10.500 2.500h3v4.500l2.500 3V20a1.500 1.500 0 0 1-1.500 1.500h-5A1.500 1.500 0 0 1 8 20V10l2.500-3ZM10.500 4.800h3", f: "M12 11.500c1.500 1.800 2.200 3 2.200 4.100a2.200 2.200 0 0 1-4.400 0c0-1.100.7-2.300 2.200-4.100Z" },
      sauce: { d: "M10 2.500h4v4l2.500 3.500v10.500a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V10L10 6.500ZM10 5h4M7.500 12.500h9v5.500h-9" },
      honey: { d: "M6.500 8h11c1.500 1.200 2.500 3 2.500 5.500 0 4-2.500 7.500-5 7.500H9c-2.500 0-5-3.500-5-7.500C4 11 5 9.200 6.500 8ZM6 4.500h12V8H6ZM12 11.500l2.600 1.500v3L12 17.500 9.400 16v-3Z" },
      jar: { d: "M7 3h10v3H7ZM6.500 6h11c1 1 1.500 2 1.500 3.500V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9.500C5 8 5.500 7 6.500 6ZM5 11.500h14M5 17h14" },
      can: { d: "M5 6c0-1.400 3.100-2.500 7-2.500s7 1.100 7 2.500v12c0 1.400-3.100 2.500-7 2.500S5 19.400 5 18ZM5 6c0 1.400 3.100 2.500 7 2.500S19 7.400 19 6M5 11c1.300 1 4 1.600 7 1.600s5.700-.6 7-1.600M5 16c1.300 1 4 1.600 7 1.600s5.700-.6 7-1.600" },
      salt: { d: "M8 8.500h8l1.500 12.500h-11ZM9 8.500l.6-3.500c.3-1.500 1.200-2.500 2.400-2.500s2.100 1 2.400 2.500l.6 3.500M11 5.500h.01M13 5.500h.01M10 15c1.300 1 2.700 1 4 0" },
      spice: { d: "M4 11h16c0 4-1.800 7-4.500 8.200v2.300h-7v-2.300C5.800 18 4 15 4 11ZM13.500 11 18 2.500M16.500 11l3.500-6.500M8 8h.01M10.500 6h.01" },
      sugar: { d: "M3.500 13h8v7.500h-8ZM12.500 13h8v7.500h-8ZM8 4.500h8V12H8Z" },
      nut: { d: "M9 3.500c2.800-.6 4.800 1 5 3.700.1 1.600.6 2.500 1.800 3.500 2.600 2.200 3.200 5.800 1 8.300-2.200 2.600-6.300 2.500-8.300-.2-1.300-1.800-1.300-3.500-1-5.200.3-1.500-.2-2.500-.9-4C5.400 6.900 6.300 4.100 9 3.500ZM9.500 7.500h.01M11 11.500h.01M12 16h.01M14.500 14h.01" },
      chocolate: { d: "M5 3h14v18H5ZM5 9h14M5 15h14M12 3v18" },
      snack: { d: "M6 3h12l-1 3 1 3v9l-1 3H7l-1-3V9l1-3ZM7 6h10M9 14.500a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" },
      seaweed: { d: "M7 22c-2-4 2-5.500 0-9.500s2-5.500.5-10M12 22c-2-4 2-5.500 0-9.500s2-5.500.5-10M17 22c-2-4 2-5.500 0-9.500s2-4.500 1-8" },
      soup: { d: "M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9ZM8 8.500c-1-1.200 1-2 0-3.500M12 8.500c-1-1.200 1-2 0-3.500M16 8.500c-1-1.200 1-2 0-3.500" },
      // Drinks
      glass: { d: "M6 3h12l-1.300 18H7.300ZM6.400 8.500c3.700 1.200 7.500 1.200 11.200 0M9.500 12.500l.3 4.500" },
      water: { d: "M12 2.500c4 4.500 6.500 8 6.500 11.500a6.500 6.500 0 0 1-13 0C5.500 10.500 8 7 12 2.500ZM9 14.500c.2 1.600 1.100 2.700 2.600 3.100" },
      soda: { d: "m6 8 1.750 12.280a2 2 0 0 0 2 1.720h4.540a2 2 0 0 0 2-1.720L18 8M5 8h14M7 15a6.470 6.470 0 0 1 5 0 6.470 6.470 0 0 0 5 0M12 8l1-6h2" },
      coffee: { d: "M10 2v2M14 2v2M6 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" },
      wine: { d: "M8 22h8M7 10h10M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.500 4-2 6-2 8a5 5 0 0 0 5 5Z" },
      beer: { d: "M17 11h1a3 3 0 0 1 0 6h-1M9 12v6M13 12v6M14 7.500c-1 0-1.440.5-3 .5s-2-.5-3-.5-1.720.5-2.500.5a2.500 2.500 0 0 1 0-5c.78 0 1.570.5 2.500.5S9.440 2 11 2s2 1.500 3 1.500 1.720-.5 2.500-.5a2.500 2.500 0 0 1 0 5c-.78 0-1.500-.5-2.500-.5ZM5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" },
} as const satisfies Record<string, Glyph>;

export type FoodGlyph = keyof typeof foodGlyphs;

/** Two-stop pastel behind each pictogram. */
const gradients = {
      butter: ["#fdf0b7", "#fedfbe"],
      blush: ["#ffe2ea", "#fff0e7"],
      sunset: ["#ff9c86", "#ffc98a"],
      sky: ["#dce9fe", "#f0e4fd"],
      mint: ["#d5f3e3", "#eaf7d9"],
      peach: ["#ffd9c2", "#ffeccf"],
      berry: ["#ffc9d8", "#ffe3d8"],
      lilac: ["#e6dcff", "#fbe3f3"],
      citrus: ["#fff0a8", "#e6f5bd"],
      cocoa: ["#f1dac9", "#fbeadb"],
} as const;

const gradientOf: Record<keyof typeof gradients, FoodGlyph[]> = {
      butter: ["pasta", "rice", "wheat", "cereal", "corn", "banana", "pineapple", "cheese", "butter", "honey", "egg", "soup"],
      blush: ["drumstick", "ham", "bacon", "yogurt", "iceCream", "cake", "taco", "pizza"],
      sunset: ["tomato", "pumpkin", "mango", "carrot", "shrimp", "bellPepper"],
      sky: ["milk", "glass", "water", "fish", "salt", "sugar", "coconut", "tofu"],
      mint: ["leafy", "herb", "broccoli", "cucumber", "avocado", "beans", "pear", "seaweed", "watermelon"],
      peach: ["bread", "arepa", "potato", "onion", "sausage", "steak", "spice", "flour"],
      berry: ["apple", "strawberry", "cherry", "chili", "wine"],
      lilac: ["grape", "eggplant", "garlic", "soda", "mushroom"],
      citrus: ["citrus", "oil", "beer"],
      cocoa: ["nut", "chocolate", "coffee", "cookie", "sauce", "jar", "can", "snack"],
};
const gradientByGlyph = new Map(Object.entries(gradientOf).flatMap(([name, list]) => list.map((g) => [g, gradients[name as keyof typeof gradients]] as const)));
const fallbacks = Object.values(gradients);

export function foodGradient(glyph: FoodGlyph | null, seed = 0) {
      const [from, to] = (glyph && gradientByGlyph.get(glyph)) ?? fallbacks[seed % fallbacks.length]!;
      return `linear-gradient(135deg, ${from}, ${to})`;
}

// Spanish first; English for the recipe library. The word that comes first in the name wins («galletas de avena» is a
// cookie); for the same position, the order here decides.
const words: [FoodGlyph, RegExp][] = [
      ["can", /\b(pasta|salsa|pure) de tomate|tomato (paste|sauce)|enlatad|conserva/],
      ["jar", /\b(mantequilla|crema) de (mani|almendra|avellana)|(peanut|almond) butter|mermelada|\bjam\b|arequipe|dulce de leche|mayonesa|mayonnaise|mostaza|mustard|gochujang|encurtid|aceituna|olives?\b|hummus/],
      ["coconut", /\b(leche|crema|aceite) de coco|coco(nut)?\b/],
      ["sauce", /\bsalsas?\b|tamari|\bsoya\b|\bsoy\b|vinagre|vinegar|ketchup|\bsauce\b/],
      ["cookie", /galleta|cookie|cracker|tostadas?\b/],
      ["cake", /\btorta|ponque|\bcake|pastel|muffin|brownie/],
      ["pizza", /pizza/],
      ["iceCream", /helado|ice cream/],
      ["chocolate", /chocolate|cacao|cocoa/],
      ["snack", /papas? (fritas|chips)|chips\b|pasabocas|snack|palomitas|crispetas/],
      ["flour", /harina|maizena|fecula|almidon|flour|starch|levadura|yeast|polvo de hornear|baking/],
      ["sugar", /azucar|sugar|panela|endulzante|stevia/],
      ["honey", /\bmiel|honey|maple|jarabe|syrup/],
      ["coffee", /\bcafe|coffee|\bte\b|\btea\b|aromatica/],
      ["wine", /\bvinos?\b|\bwine/],
      ["beer", /cerveza|\bbeer|malta/],
      ["soda", /gaseosa|\bsoda|refresco|energizante/],
      ["water", /^agua\b|^water\b/],
      ["glass", /\bjugos?\b|\bjuice|nectar|bebida|limonada|avena liquida|smoothie/],
      ["soup", /\bcaldos?\b|\bsopas?\b|broth|stock\b|consome/],
      ["yogurt", /yogur|yoghurt|kumis|skyr|kefir|\bcrema agria|sour cream/],
      ["cheese", /queso|quesito|cheese|parmesano|parmesan|mozzarella|pecorino|cheddar|ricotta|cuajada|feta\b/],
      ["butter", /mantequilla|butter|margarina|ghee|manteca/],
      ["milk", /leche|\bmilk|crema|\bcream|nata\b|suero/],
      ["egg", /huevo|\beggs?\b|clara de|yema/],
      ["oil", /aceite|\boil\b/],
      ["tofu", /tofu|tempeh|seitan/],
      ["bacon", /tocin|tocineta|panceta|bacon|chicharron/],
      ["sausage", /salchich|chorizo|butifarra|longaniza|morcilla|sausage|hot dog|salami|pepperoni/],
      ["ham", /jamon|\bham\b|lomo de cerdo|cerdo|pork|costilla|mortadela/],
      ["drumstick", /pollo|pavo|gallina|pechuga|muslo|contramuslo|chicken|turkey|\bduck|\bpato\b/],
      ["shrimp", /camaron|langostin|gamba|shrimp|prawn|marisco|calamar|pulpo|cangrejo|crab|lobster|langosta|mejillon|almeja/],
      ["fish", /pescado|salmon|\batun|\btuna|bacalao|\bcod\b|tilapia|trucha|trout|sardina|anchoa|merluza|robalo|corvina|\bfish/],
      ["steak", /\bcarnes?\b|\bres\b|ternera|lomo|\bbeef|steak|\bveal|cordero|\blamb|hamburguesa|albondiga|meatball|higado/],
      ["pasta", /pasta|rigatoni|espagueti|spaghetti|fideo|macarr|tallarin|lasa[nñ]a|noodle|penne|ramen|raviol|cuscus|couscous/],
      ["rice", /arroz|\brice|quinua|quinoa|risotto/],
      ["cereal", /cereal|granola|corn ?flakes|muesli|zucaritas/],
      ["wheat", /avena|\boats?\b|trigo|wheat|cebada|barley|hojuelas|salvado|linaza|chia|semillas?|ajonjoli|sesame|seeds?\b/],
      ["beans", /frijol|lenteja|garbanzo|arveja|\bbeans?\b|lentil|chickpea|\bpeas?\b|edamame|habas?\b/],
      ["taco", /tortilla|taco|burrito|wrap\b/],
      ["arepa", /arepa|almojabana|pandebono|bu[nñ]uelo|empanada|pancake|waffle/],
      ["bread", /\bpan(es)?\b|\bbread|baguette|croissant|tostado|\bbuns?\b|panko/],
      ["nut", /\bmani\b|almendra|nuez|nueces|mara[nñ]on|pistacho|avellana|peanut|almond|walnut|cashew|\bnuts?\b|pecan/],
      ["tomato", /tomate|tomato/],
      ["garlic", /\bajos?\b|garlic/],
      ["onion", /cebolla|onion|chalota|shallot|puerro|leek|remolacha|beet|rabano|radish/],
      ["potato", /\bpapas?\b|potato|yuca|[nñ]ame|arracacha|camote|batata|malanga|jengibre|ginger/],
      ["carrot", /zanahoria|carrot/],
      ["cucumber", /pepin|cucumber|calabacin|zucchini/],
      ["pumpkin", /auyama|calabaza|ahuyama|pumpkin|squash|zapallo/],
      ["chili", /\baji\b|\bchile|chili|jalape|cayena|picante/],
      ["bellPepper", /pimenton|pimiento|bell pepper|\bmorron/],
      ["corn", /maiz|mazorca|\bcorn/],
      ["broccoli", /brocoli|broccoli|coliflor|cauliflower/],
      ["mushroom", /champi[nñ]on|hongo|seta|mushroom|portobello/],
      ["eggplant", /berenjena|eggplant|aubergine/],
      ["avocado", /aguacate|avocado|palta/],
      ["leafy", /lechuga|espinaca|acelga|repollo|col\b|kale|rucula|lettuce|spinach|cabbage|arugula|apio|celery|esparrago|asparagus|alcachofa/],
      ["herb", /cilantro|albahaca|perejil|menta|hierbabuena|romero|tomillo|laurel|eneldo|oregano|cebollin|basil|parsley|\bmint\b|thyme|rosemary|\bdill|herb|hierba|coriander/],
      ["banana", /banan|platano|plantain|guineo/],
      ["citrus", /limon|naranja|mandarina|toronja|lemon|\blime|orange|grapefruit|maracuya|lulo/],
      ["strawberry", /fresa|frambuesa|\bmoras?\b|strawberr|raspberr|blackberr|frutos rojos/],
      ["grape", /\buvas?\b|grape|pasas|raisin|arandano|blueberr|ciruela|plum/],
      ["cherry", /cereza|cherr/],
      ["pineapple", /\bpi[nñ]a\b|pineapple/],
      ["mango", /mango|papaya|durazno|melocoton|peach|guayaba|guava|apricot|albaricoque/],
      ["watermelon", /sandia|melon\b|watermelon/],
      ["pear", /\bperas?\b|\bpears?\b|kiwi|\bfig\b|higo/],
      ["apple", /manzana|apple|\bfrutas?\b|\bfruit/],
      ["seaweed", /\balga|nori|seaweed/],
      ["salt", /\bsal\b|\bsalt\b/],
      ["spice", /pimienta|paprika|comino|canela|curcuma|curry|especia|condimento|adobo|sazon|clavo|nuez moscada|pepper|cumin|cinnamon|spice|vainilla|vanilla/],
];

// Slugs the API sends in `icon`, for names that say nothing.
const slugs: Record<string, FoodGlyph> = {
      cheese: "cheese", pasta: "pasta", noodles: "pasta", egg: "egg", eggs: "egg", leaf: "leafy", herb: "herb", vegetable: "leafy", greens: "leafy", sprout: "herb",
      tomato: "tomato", grain: "wheat", oats: "wheat", rice: "rice", milk: "milk", dairy: "milk", bottle: "sauce", cup: "yogurt", glass: "glass", chicken: "drumstick",
      poultry: "drumstick", drumstick: "drumstick", fish: "fish", seafood: "fish", shrimp: "shrimp", bread: "bread", oil: "oil", drop: "oil", fruit: "apple", lemon: "citrus",
      citrus: "citrus", garlic: "garlic", onion: "onion", spice: "spice", salt: "salt", pepper: "spice", flame: "chili", meat: "steak", beef: "steak", pork: "ham",
      honey: "honey", jar: "jar", can: "can", banana: "banana", pineapple: "pineapple", avocado: "avocado", carrot: "carrot", cucumber: "cucumber", potato: "potato",
      flour: "flour", legume: "beans", cereal: "cereal", cookie: "cookie", butter: "butter", tofu: "tofu",
};

const plain = (text: string) => text.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
const cache = new Map<string, FoodGlyph | null>();

/** The pictogram for an ingredient or a dish: by its name, then by the API's slug. */
export function foodGlyphFor(label: string, icon?: string | null): FoodGlyph | null {
      const key = `${label}|${icon ?? ""}`;
      const known = cache.get(key);
      if (known !== undefined) return known;
      const name = plain(label);
      let best: FoodGlyph | null = null;
      let at = Infinity;
      for (const [glyph, re] of words) {
            const index = re.exec(name)?.index ?? Infinity;
            if (index < at) {
                  at = index;
                  best = glyph;
            }
      }
      const found = best ?? (icon ? (slugs[icon] ?? null) : null);
      cache.set(key, found);
      return found;
}
