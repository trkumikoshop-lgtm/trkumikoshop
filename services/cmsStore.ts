
import { SiteConfig } from '../types';

const STORAGE_KEY = 'tr_kumiko_config';

const DEFAULT_CONFIG: SiteConfig = {
  "logoUrl": "data:image/jpeg;base64,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",
  "siteName": "TR-KUMIKO Arte en Madera & Corte Láser",
  "home": {
    "title": "TR-KUMIKO: Esencia de Tilo",
    "subtitle": "Geometría japonesa milenaria unida por la precisión del láser y el alma del artesano.",
    "heroImage": "https://github.com/trkumikoshop-lgtm/images/blob/main/Portada_pic1.jpg?raw=true"
  },
  "about": {
    "title": "El Arte del Detalle",
    "content": "TR‑KUMIKO nace de una obsesión hermosa: la búsqueda de la perfección geométrica. Trabajamos exclusivamente con madera de tilo de la más alta calidad, apreciada por su suavidad y su tono claro, un lienzo natural que permite que cada pieza dialogue con la luz y las sombras de una manera casi hipnótica.\n\nCada patrón se construye con la paciencia y el respeto que exige una técnica milenaria. En cada unión, en cada ángulo, buscamos ese punto exacto donde la precisión del corte láser se encuentra con la sensibilidad del acabado manual, ese toque humano que da alma a la madera.\n\nAdemás, incorporamos tecnología de corte láser para crear grabados y detalles en distintos materiales, logrando una precisión que roza lo escultórico y piezas cortadas con una exactitud impecable.",
    "image": "https://github.com/trkumikoshop-lgtm/images/blob/main/Sobre_mi_pic1.jpg?raw=true"
  },
  "contact": {
    "title": "Contacta con el Taller",
    "description": "¿Tienes un proyecto en mente o buscas una pieza a medida? Hablemos sobre cómo la geometría del Kumiko puede transformar tu espacio.",
    "email": "trkumikoshop@gmail.com",
    "phone": "+34 651802781",
    "instagram": "trbkumiko"
  },
  "categories": [
    "CARPINTERÍA KUMIKO",
    "CORTE LÁSER",
    "GRABADO LÁSER",
    "VARIOS"
  ],
  "categoryFamilies": {
    "Lámparas": [
      "Asanoha",
      "Sakura",
      "Izutsu-tsunagi"
    ],
    "Paneles": [
      "Shoji Style",
      "Wall Art"
    ],
    "Decoración": [
      "Cajas",
      "Posavasos"
    ],
    "CARPINTERÍA KUMIKO": [
      "ADORNOS",
      "CAJAS",
      "CUADROS"
    ],
    "CORTE LÁSER": [
      "MULTICAPA",
      "LÁMPARAS"
    ],
    "GRABADO LÁSER": [
      "LLAVEROS",
      "LÁMPARAS LED"
    ],
    "VARIOS": [
      "POSAVASOS",
      "CARTELES",
      "CASAS"
    ]
  },
  "products": [
    {
      "id": "1771790710004",
      "name": "Heartlight RGB - Corazones de Luz en 3D",
      "price": 30,
      "description": "HEARTLIGHT RGB es la lámpara perfecta para quienes quieren llenar su hogar de calidez, estilo y un toque emocional que nunca pasa desapercibido. Su diseño acrílico en 3D recrea un corazón luminoso con un efecto holográfico que parece flotar suavemente sobre la base, creando una atmósfera acogedora y encantadora. Es una pieza decorativa que transforma cualquier rincón en un espacio especial, lleno de personalidad y buenas vibraciones.\nLas bases con iluminación RGB multicolor despliegan un abanico de tonos que puedes adaptar a cada momento: colores suaves para relajarte, tonos vibrantes para animar la habitación o transiciones dinámicas que llenan el ambiente de vida. La luz recorre cada línea del diseño con una delicadeza hipnótica, haciendo que la lámpara destaque incluso apagada.\nEs ese tipo de objeto que imaginas en tu salón, en tu dormitorio o en tu rincón favorito, aportando un toque romántico y moderno a la vez. Una mezcla perfecta de diseño, emoción y tecnología que te hace pensar: “esta la quiero en mi casa”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Heartlight_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Heartlight_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Heartlight_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771790480790",
      "name": "Geo Elephant RGB - Elefantes de Luz en 3D",
      "price": 30,
      "description": "GEO ELEPHANT RGB es la lámpara perfecta para quienes buscan una pieza decorativa capaz de transformar cualquier espacio con estilo, originalidad y un toque de magia. Su diseño acrílico en 3D recrea un elefante geométrico con líneas limpias y futuristas que, al encenderse, parecen cobrar vida en un efecto holográfico hipnótico. Es una pieza que aporta personalidad y un aire moderno sin perder ese encanto cálido que invita a mirarla una y otra vez.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes adaptar al ambiente que quieras crear: colores suaves para relajarte, tonos brillantes para energizar la habitación o transiciones dinámicas que llenan el espacio de movimiento y luz. La forma en que la iluminación recorre el grabado hace que la figura destaque incluso apagada.\nEs ese tipo de lámpara que imaginas en tu salón, en tu dormitorio o en tu rincón favorito, aportando carácter y un brillo especial. Una mezcla perfecta de diseño, tecnología y encanto que te hace pensar: “esta la quiero en mi casa”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Geo_elephant_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Geo_elephant_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Geo_elephant_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771790140429",
      "name": "Zenlight Buddha RGB - Serenidad Lumínica en 3D",
      "price": 30,
      "description": "ZENLIGHT BUDDHA RGB es mucho más que una lámpara: es un pequeño templo de luz que transforma cualquier rincón en un espacio de calma, equilibrio y belleza. Su panel acrílico recrea la figura de un Buda sentado con un efecto 3D tan delicado y preciso que parece irradiar paz desde el interior. Es una pieza decorativa que aporta armonía y un toque espiritual sin perder la estética moderna.\nLas bases con iluminación RGB multicolor despliegan un abanico de tonos que puedes adaptar a tu estado de ánimo o al ambiente que quieras crear: colores suaves para meditar, tonos brillantes para energizar la habitación o transiciones dinámicas que llenan el espacio de vida. La luz se filtra por el grabado con una serenidad hipnótica, convirtiendo la lámpara en un punto focal que invita a respirar hondo y relajarse.\nEs ese tipo de objeto que imaginas en tu salón, en tu dormitorio o en tu rincón de meditación, aportando equilibrio y un brillo especial. Una mezcla perfecta de arte, espiritualidad y tecnología que te hace pensar: “esta la necesito en mi hogar”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Zenlight_Buddha_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Zenlight_Buddha_RGB_pic2.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771789914468",
      "name": "Elephant Glow RGB - Elefantitos de Luz en 3D",
      "price": 30,
      "description": "ELEPHANT GLOW RGB es la lámpara perfecta para quienes buscan un detalle decorativo dulce, moderno y capaz de llenar cualquier espacio de buen rollo. Su diseño acrílico en 3D recrea un elefantito adorable que parece cobrar vida cuando la luz se enciende, creando un efecto holográfico que roba miradas y sonrisas al instante. Es una pieza que aporta calidez, personalidad y un toque juguetón a cualquier rincón del hogar.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes adaptar a tu estado de ánimo: colores suaves para un ambiente relajante, tonos brillantes para animar la habitación o transiciones dinámicas que llenan el espacio de energía. La luz se filtra por el grabado con una delicadeza hipnótica, haciendo que la figura destaque incluso apagada.\nEs ese tipo de lámpara que imaginas en tu salón, en la habitación de los peques o en tu escritorio, aportando encanto y un brillo especial. Una mezcla perfecta de ternura, diseño y tecnología que te hace pensar: “esta la quiero en mi casa”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Elephant_glow_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Elephant_glow_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Elephant_glow_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771789663580",
      "name": "Sail Glow RGB - Navíos Lumínicos en 3D",
      "price": 30,
      "description": "SAIL GLOW RGB es la lámpara perfecta para quienes sienten fascinación por el mar, la aventura y los objetos decorativos que cuentan historias. Su panel acrílico recrea un majestuoso barco con un efecto 3D tan nítido que parece navegar sobre una ola de luz. Es una pieza que transforma cualquier estancia en un rincón lleno de carácter, calma y estilo.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes adaptar al ambiente que quieras crear: colores suaves para una atmósfera relajante, tonos intensos para un toque más moderno o transiciones dinámicas que llenan la habitación de vida. La luz se filtra por el grabado con una precisión hipnótica, haciendo que la lámpara destaque incluso apagada.\nEs ese tipo de objeto que imaginas en tu salón, en tu despacho o en tu dormitorio, aportando personalidad y un brillo especial. Una mezcla perfecta de diseño, nostalgia marinera y tecnología que te hace pensar: “esta la quiero en mi casa”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Sail_glow_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Sail_glow_RGB_pic2.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771789453092",
      "name": "Butterfly Dream RGB - Frascos de Luz Encantada",
      "price": 30,
      "description": "BUTTERFLY DREAM RGB es la lámpara perfecta para quienes buscan un detalle decorativo capaz de transformar cualquier rincón en un espacio cálido, poético y lleno de encanto. Su diseño acrílico recrea un frasco lleno de mariposas luminosas, como si hubieran quedado suspendidas en un instante mágico. El efecto 3D es tan suave y envolvente que parece que las mariposas flotan realmente dentro de la luz.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes adaptar a tu estado de ánimo: colores relajantes para crear un ambiente tranquilo, tonos brillantes para dar vida a la habitación o transiciones dinámicas que llenan el espacio de movimiento y fantasía. La luz se difunde con una delicadeza que convierte la lámpara en un punto focal irresistible, incluso cuando está apagada.\nEs ese tipo de pieza que imaginas en tu salón, en tu dormitorio o en tu rincón favorito de lectura, aportando serenidad y un toque de magia. Una mezcla perfecta de diseño, naturaleza y tecnología que te hace pensar: “esta la quiero en mi casa”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Butterfly_dream_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Butterfly_dream_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Butterfly_dream_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771789188742",
      "name": "Retrocall RGB - Teléfonos Lumínicos en 3D",
      "price": 30,
      "description": "RETROCALL RGB es la lámpara perfecta para quienes disfrutan de los objetos con historia, pero quieren darles un giro moderno y sorprendente. Su panel acrílico recrea un teléfono clásico con un efecto 3D tan nítido que parece flotar sobre la base, iluminándose con un brillo elegante y lleno de carácter. Es una pieza decorativa que convierte cualquier rincón en un punto de conversación instantáneo.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes adaptar al ambiente que quieras crear: luz suave para un toque vintage acogedor, colores intensos para un estilo más moderno o transiciones dinámicas que llenan la habitación de energía. La luz se filtra por el grabado con una precisión hipnótica, haciendo que la lámpara destaque incluso apagada.\nEs ese tipo de objeto que imaginas en tu salón, en tu estudio o junto a tu colección de piezas especiales, aportando personalidad y un toque único. Una mezcla perfecta de nostalgia, diseño y tecnología que te hace pensar: “esta la quiero en mi casa”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Retrocall_RGB_Pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Retrocall_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Retrocall_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771789077535",
      "name": "Neo Mind RGB - Cabeza Holográfia en 3D",
      "price": 30,
      "description": "NEO MIND RGB es una lámpara diseñada para quienes aman el arte digital, la estética futurista y los objetos que cuentan una historia sin decir una palabra. Su panel acrílico recrea una cabeza geométrica con un efecto 3D sorprendente, como si una mente digital estuviera tomando forma justo delante de ti. Es una pieza que transforma cualquier espacio en un rincón creativo, moderno y lleno de personalidad.\nLa base con iluminación RGB multicolor despliega un abanico vibrante de tonos que puedes adaptar al ambiente que quieras crear: luz suave para relajarte, colores intensos para inspirarte o transiciones dinámicas que llenan la habitación de energía. La luz se filtra por el grabado con una precisión hipnótica, haciendo que la figura destaque incluso cuando no está encendida.\nEs ese tipo de lámpara que imaginas en tu escritorio, en tu salón o en tu estudio creativo, aportando un toque de diseño que no pasa desapercibido. Una mezcla perfecta de arte, tecnología y estilo que te hace pensar: “esta la necesito en mi espacio”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Neo_mind_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Neo_mind_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Neo_mind_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771788368807",
      "name": "Geometrical Bloom RGB - Arte Lumínico en 3D",
      "price": 30,
      "description": "GEOMETRIC BLOOM RGB es la lámpara que convierte cualquier espacio en un rincón moderno, cálido y lleno de estilo. Su diseño acrílico en 3D revela una flor geométrica que se ilumina con una precisión casi hipnótica, creando un efecto visual que mezcla arte, tecnología y serenidad. Es de esas piezas que elevan la decoración sin esfuerzo, aportando un toque sofisticado que no pasa desapercibido.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes adaptar a tu estado de ánimo o al ambiente que quieras crear: luz suave para relajarte, colores intensos para energizar la habitación o transiciones dinámicas que llenan el espacio de vida. La luz se filtra por el grabado con una delicadeza que hace que la lámpara destaque incluso apagada.\nEs el tipo de objeto que imaginas en tu mesa de centro, en tu dormitorio o en tu zona de lectura, aportando personalidad y un brillo especial. Una mezcla perfecta de diseño contemporáneo y magia lumínica que te hace pensar: “esta la quiero en mi casa”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Geometrical_bloom_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Geometrical_bloom_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Geometrical_bloom_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771787996967",
      "name": "Lotus Glow RBG - Flores de Luz en 3D",
      "price": 30,
      "description": "LOTUS GLOW RGB es mucho más que una lámpara: es un pequeño santuario de luz que transforma cualquier espacio en un rincón de calma y belleza. Su diseño acrílico en 3D recrea una flor de loto luminosa que parece abrirse suavemente sobre la base, creando un efecto visual hipnótico y lleno de armonía. Es la pieza perfecta para quienes buscan decoración moderna con un toque espiritual y artístico.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes adaptar a tu estado de ánimo: colores suaves para relajarte, tonos brillantes para energizar el ambiente o transiciones dinámicas que llenan la habitación de vida. La luz se difunde a través del grabado con una delicadeza que convierte la lámpara en un punto focal irresistible.\nEs ese tipo de objeto que imaginas encendido en tu salón, tu dormitorio o tu espacio de meditación, aportando serenidad y un toque de magia. Una mezcla perfecta de diseño, tecnología y emoción que hace que quieras tener una… o incluso regalar otra.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Lotus_glow_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Lotus_glow_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Lotus_glow_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771787413112",
      "name": "Photo Glow RGB - Cámaras Lumínicas en 3D",
      "price": 30,
      "description": "PHOTO GLOW RGB es la lámpara perfecta para quienes aman la fotografía, el diseño moderno y los detalles que marcan la diferencia. Su panel acrílico crea una ilusión 3D espectacular con la silueta de una cámara que parece flotar sobre la base, iluminándose con un brillo limpio, preciso y lleno de estilo. Es una pieza decorativa que convierte cualquier mesa, estantería o rincón del salón en un punto focal lleno de personalidad.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes ajustar según tu ambiente: luz suave para relajarte, colores intensos para animar la habitación o transiciones dinámicas que llenan el espacio de energía creativa. La combinación del diseño técnico con el efecto holográfico hace que la lámpara destaque incluso apagada.\nEs ese tipo de objeto que ves y piensas: “esto quedaría increíble en mi estudio, en mi salón o junto a mi colección de cámaras”. Una mezcla perfecta de arte, tecnología y pasión por la imagen.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Photo_glow_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Photo_glow_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Photo_glow_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771786882256",
      "name": "Ocean Wave RGB - Delfines Lumínicos en 3D",
      "price": 30,
      "description": "OCEAN WAVE RGB es la lámpara que convierte cualquier espacio en un rincón lleno de calma, magia y movimiento. Su diseño acrílico en 3D recrea la silueta de un delfín con un efecto holográfico que parece flotar sobre la base, como si estuviera surcando una ola luminosa. Es una pieza decorativa que transmite serenidad y, al mismo tiempo, un toque futurista que no pasa desapercibido.\nLas bases con iluminación RGB multicolor despliegan un abanico vibrante de tonos que puedes adaptar a tu estado de ánimo: desde colores suaves y relajantes hasta combinaciones más intensas y dinámicas. La luz se difunde a través del grabado creando un efecto visual hipnótico que transforma por completo la atmósfera de la habitación.\nEs el tipo de lámpara que te imaginas encendida en tu salón, tu dormitorio o tu zona de trabajo, aportando personalidad y un brillo especial. Una mezcla perfecta de arte, tecnología y emoción que te hace pensar: “quiero una en mi casa”.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Ocean_wave_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Ocean_wave_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Ocean_wave_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771786505985",
      "name": "Dragon Glow RGB - Criaturas Lumínicas en 3D",
      "price": 30,
      "description": "DRAGON GLOW RGB es la lámpara que convierte cualquier rincón en un pequeño universo mágico. Su diseño acrílico en 3D revela una criatura fantástica llena de personalidad, iluminada con un brillo que parece cobrar vida. Es una pieza que no solo decora: captura miradas, despierta sonrisas y transforma el ambiente al instante.\nCada base incorpora iluminación RGB multicolor, capaz de desplegar un abanico vibrante de tonos que se mezclan suavemente o cambian de forma dinámica. El resultado es una luz envolvente que crea atmósferas cálidas, divertidas o futuristas según el momento. Perfecta para salones modernos, habitaciones juveniles o como regalo que sorprende de verdad.\nEs de esos objetos que no sabías que necesitabas… hasta que lo ves iluminado y te imaginas dónde quedaría perfecto en tu casa.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Dragon_glow_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Dragon_glow_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Dragon_glow_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1771785936889",
      "name": "Aura Hand RGB - Esculturas lumínicas holográficas",
      "price": 30,
      "description": "AURA HAND RGB no es solo una lámpara: es una pieza de arte tecnológico diseñada para transformar cualquier espacio en un rincón lleno de personalidad y estilo. Su holograma en forma de mano flotante crea un efecto visual hipnótico, limpio y futurista, perfecto para quienes buscan decoración moderna con un toque sorprendente.\nCada base incorpora iluminación RGB dinámica, capaz de desplegar un abanico vibrante de colores que se mezclan, cambian y envuelven el holograma con un brillo único. El resultado es una luz ambiental que no solo ilumina, sino que crea atmósfera, inspira creatividad y convierte cualquier estancia en un lugar especial.\nEs el tipo de objeto que hace que tus invitados pregunten “¿dónde lo has conseguido?”. Una pieza que combina diseño, tecnología y emoción en un solo gesto luminoso.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Aura_hand_RGB_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Aura_hand_RGB_pic2.png?raw=true",
        "https://github.com/trkumikoshop-lgtm/images2/blob/main/Aura_hand_RGB_pic3.png?raw=true"
      ],
      "category": "GRABADO LÁSER",
      "family": "LÁMPARAS LED",
      "isCustomizable": true
    },
    {
      "id": "1770457416705",
      "name": "Lámpara Geometría de Luz",
      "price": 30,
      "description": "La Lámpara Geometría de Luz es una pieza decorativa que fusiona diseño moderno con artesanía en madera. Su estructura en forma de prisma rectangular está compuesta por piezas entrelazadas que forman un patrón hipnótico de cuadrados concéntricos, creando un juego de luces y sombras que transforma cualquier rincón en un espacio cálido y sofisticado.\nFabricada con precisión milimétrica, esta lámpara no solo ilumina: esculpe la luz, proyectando formas geométricas sobre las superficies cercanas. Ideal para ambientes minimalistas, nórdicos o con toques zen, su diseño simétrico aporta equilibrio visual y una presencia elegante que no pasa desapercibida.\nLa luz es RGB que cambia de color, pasando por un abánico de ambientes, lo que hace que sea aún más atractiva.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Lampara_geometria_de_luz_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Lampara_geometria_de_luz_pic2.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Lampara_geometria_de_luz_pic3.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Lampara_geometria_de_luz_pic4.jpg?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "LÁMPARAS",
      "isCustomizable": true,
      "videoUrl": "https://image2url.com/r2/default/videos/1770457978656-f30524cb-c35c-407f-a62c-b3b4b19a5e2e.mp4"
    },
    {
      "id": "1770401023058",
      "name": "Cuadro patrón Asa-no-ha",
      "price": 0,
      "description": "Cuadro con patrón Asa-no-ha que significa literalmente \"hoja de cáñamo\".\nEl cáñamo crece rápido, recto, resistente y en terrenos difíciles y por eso simboliza el crecimiento sano, protección y fortaleza.\nPara los japoneses es muy importante este símbolo de protección, llegando a bordarlo en la ropa de los bebes.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Cuadro_patron_asanoha_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Cuadro_patron_asanoha_pic2.jpg?raw=true"
      ],
      "category": "CARPINTERÍA KUMIKO",
      "family": "CUADROS",
      "isCustomizable": true
    },
    {
      "id": "1770315201665",
      "name": "Casitas Navideñas",
      "price": 0,
      "description": "Casas en tres tamaños para recrear un pueblo navideño. Este trabajo se realizó por encargo.\nPrimero se diseñó cada casa a gusto del cliente y una vez pactado el diseño se cortó con láser.\nEl video fue realizado por el cliente que quedó muy satisfecho.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Casas_navidad_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Casas_navidad_pic2.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Casas_navidad_pic3.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Casa_navidad_pic4.jpg?raw=true"
      ],
      "category": "VARIOS",
      "family": "CASAS",
      "isCustomizable": true,
      "videoUrl": "https://github.com/trkumikoshop-lgtm/videos/blob/main/docs/Casas_navidad_vid1.mp4"
    },
    {
      "id": "1770314119463",
      "name": "Carteles decorativos",
      "price": 20,
      "description": "Carteles grabados con frases famosas o con frases personalizadas para colocar en cualquier parte de la casa.\nTotalmente personalizable para realizar un regalo a alguien querido o a una amistad.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Carteles_decorativos_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Carteles_decorativos_pic2.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Carteles_decorativos_pic3.jpg?raw=true"
      ],
      "category": "VARIOS",
      "family": "CARTELES",
      "isCustomizable": true
    },
    {
      "id": "1770143787035",
      "name": "Triada de Luz",
      "price": 0,
      "description": "Esta obra en kumiko se compone de tres secciones que dialogan entre sí como movimientos de una sinfonía visual. En la parte superior, una estrella de ocho puntas con acentos oscuros evoca el inicio, la chispa, el centro de gravedad. El patrón central, más complejo y entrelazado, representa el flujo, la expansión, el tejido invisible que une. Finalmente, el motivo inferior, en forma de abanico, se abre como un suspiro, una despedida luminosa que invita a la contemplación.\n\nTallada en madera de tilo, cada pieza ha sido cortada con precisión láser y ensamblada a mano, respetando la tradición milenaria del kumiko. La luz atraviesa sus formas y proyecta sombras que cambian con el día, haciendo que la obra respire y se transforme.\n\n“Tríada de Luz” es más que geometría: es equilibrio, ritmo y silencio. Una invitación a detenerse y mirar.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Triada_de_luz_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Triada_de_luz_pic2.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Triada_de_luz_pic3.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Triada_de_luz_pic4.jpg?raw=true"
      ],
      "category": "CARPINTERÍA KUMIKO",
      "family": "CUADROS",
      "isCustomizable": false
    },
    {
      "id": "1769948873019",
      "name": "Trama Serena",
      "price": 0,
      "description": "Cuadro geométrico en madera, con patrones entrelazados que celebran la precisión, la armonía y la belleza artesanal.\nEsa construido con carpintería kumiko sin el uso clavos, cada pieza está cortada con precisión milimétrica para que se encajen entre ellas y una sujete a la siguiente en su posición.\nLos patrones utilizados son Asa-no-ha, Goma-gara kikko, Kasane rindo y Kawari yae-zakura.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Trama_serena_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Trama_serena_pic2.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Trama_serena_pic3.jpg?raw=true"
      ],
      "category": "CARPINTERÍA KUMIKO",
      "family": "CUADROS",
      "isCustomizable": false
    },
    {
      "id": "1769948416020",
      "name": "Caja Japonesa",
      "price": 35,
      "description": "Caja de estilo japonés que imita una caja de herramientas tradicional japonesa.\nIdeal y original para guardar pequeñas cosas privadas.\nMedidas 16.3 cm de largo x 7 cm de alto x 7.5 cm de ancho.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Caja_japonesa_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Caja_japonesa_pic2.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Caja_japonesa_pic3.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Caja_japonesa_pic4.jpg?raw=true"
      ],
      "category": "CARPINTERÍA KUMIKO",
      "family": "CAJAS",
      "isCustomizable": false
    },
    {
      "id": "1769947910515",
      "name": "Mirada Silvetre",
      "price": 70,
      "description": "Mandala felino en madera, con mirada expresiva y patrones envolventes que transmiten misterio, ternura y arte natural.\nEstá compuesto por seis capas de madera de tilo. \nMedidas 24 cm x 39 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Mirada_silvestre_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Mirada_silvestre_pic2.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Mirada_silvestre_pic3.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Mirada_silvestre_pic4.jpg?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769947212449",
      "name": "Salto Interior",
      "price": 40,
      "description": "Mandala anfibio en madera, con silueta de rana adornada por patrones simétricos que evocan renovación, equilibrio y conexión con la tierra.\nEstá compuesto por cuatro capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 39 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Salto_interior_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Salto_interior_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769947010191",
      "name": "Flor de Equilibrio",
      "price": 65,
      "description": "Mandala floral simétrico cortado en madera, con pétalos entrelazados que irradian armonía, delicadeza y profundidad artesanal.\nEstá compuesto por seis capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 25 cm x 35 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Flor_de_equilibrio_pic1.webp?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Flor_de_equilibrio_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769946867863",
      "name": "Aliento de Vida",
      "price": 60,
      "description": "Mandala hexagonal en madera, con mariposa central rodeada de motivos botánicos que celebran la delicadeza, la transformación y la armonía natural.\nEstá compuesto por cinco capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 37 cm x 32 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Aliento_de_vida_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Aliento_de_vida_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769946715723",
      "name": "Susurro del Bosque",
      "price": 60,
      "description": "Mandala en madera con silueta de zorro, adornado con patrones florales y geométricos que evocan astucia, belleza y equilibrio natural.\nEstá compuesto por ocho capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 29 cm x 36 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Susurro_del_bosque_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Susurro_del_bosque_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769946517301",
      "name": "Alma Majestuosa",
      "price": 80,
      "description": "Mandala leonino en madera, con patrones dorados y texturas envolventes que expresan fuerza, nobleza y belleza salvaje.\nEstá compuesto por ocho capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 29 cm x 36 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Alma_majestuosa_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Alma_majestuosa_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769946354740",
      "name": "Flor del Despertar",
      "price": 60,
      "description": "Mandala circular en madera, con flores de loto entrelazadas que irradian pureza, equilibrio y profundidad espiritual.\nEstá compuesto por cinco capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 35 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Flor_del_despertar_pic1.webp?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Flor_del_despertar_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769946145251",
      "name": "Rosa del Viento",
      "price": 90,
      "description": "Mandala náutico en madera, con timón floral que fusiona dirección y belleza natural en una pieza armoniosa.\nEstá compuesto por ocho capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 37 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Rosa_del_viento_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Rosa_del_viento_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769945946467",
      "name": "Sol Interior",
      "price": 80,
      "description": "Mandala solar cortado en madera, con formas radiantes y simetría envolvente que evocan energía, equilibrio y esplendor natural.\nEstá compuesto por ocho capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 37 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Sol_interior_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Sol_interior_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769945778999",
      "name": "Raíz Noble",
      "price": 100,
      "description": "Mandala familiar en madera, con dos elefantes que evocan protección, ternura y fuerza ancestral.\nEstá compuesto por nueve capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 38 cm x 38 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Raiz_noble_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Raiz_noble_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769945196827",
      "name": "Eco de Luz",
      "price": 50,
      "description": "Mandala geométrico en madera, de formas entrelazadas y simetría precisa que transmite equilibrio, profundidad y belleza estructural.\nEstá compuesto por cinco capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 33 cm x 36 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Eco_de_luz_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Eco_de_luz_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769944982747",
      "name": "Flor Infinita",
      "price": 100,
      "description": "Mandala floral en madera, de simetría envolvente y capas delicadas que irradian equilibrio, belleza y profundidad artesanal.\nEstá compuesto por nueve capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 34 cm x 38 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Flor_infinita_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Flor_infinita_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769944834650",
      "name": "Flor de Silencio",
      "price": 60,
      "description": "Mandala felino en madera, con silueta floral que fusiona naturaleza y serenidad en una composición armoniosa.\nEstá compuesto por seis capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 37 cm x 29 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Flor_de_silencio_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Flor_de_silencio_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769944667921",
      "name": "Encuentro de Almas",
      "price": 80,
      "description": "Mandala romántico en madera, con siluetas entrelazadas en un corazón floral que celebra el amor y la naturaleza.\nEstá compuesto por siete capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 37 cm x 33 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Encuentro_de_almas_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Encuentro_de_almas_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769944470797",
      "name": "Rostro Fiel",
      "price": 70,
      "description": "Mandala canino cortado en madera, con rostro expresivo y texturas envolventes que irradian ternura, lealtad y calidez artesanal.\nEstá compuesto por siete capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 33 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Rostro_fiel_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Rostro_fiel_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769944264450",
      "name": "Jardín Alado",
      "price": 50,
      "description": "Mandala en madera con mariposas y flores entrelazadas, que celebra la belleza efímera y la armonía natural con delicadeza artesanal.\nEstá compuesto por cuatro capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 38 cm x 38 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Jardin_alado_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Jardin_alado_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769944100317",
      "name": "Abrazo de Luz",
      "price": 95,
      "description": "Mandala celestial cortado en madera, con sol y luna entrelazados en un diseño que irradia equilibrio, energía y serenidad cósmica.\nEstá compuesto por nueve capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 36 cm x 35 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Abrazo_de_luz_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Abrazo_de_luz_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769943617836",
      "name": "Dualidad Viva",
      "price": 110,
      "description": "Mandala circular cortado en madera, con símbolo yin-yang rodeado de formas ondulantes que evocan equilibrio, energía y armonía universal.\nEstá compuesto por diez capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 36 cm x 36 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Dualidad_viva_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Dualidad_viva_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769943437796",
      "name": "Paso Sereno",
      "price": 70,
      "description": "Mandala felino en madera, de silueta firme y textura envolvente, que transmite presencia, equilibrio y nobleza natural.\nEstá compuesto por siete capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 37 cm x 34 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Paso_sereno_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Paso_sereno_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769943120813",
      "name": "Latido Solar",
      "price": 90,
      "description": "Mandala en forma de corazón cortado en madera, con tres girosales que irradian calidez, vida y armonía natural.\nEstá compuesto por nueve capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 38 cm x 31 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Latido_solar_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Latido_solar_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769942997555",
      "name": "Susurro del Coral",
      "price": 40,
      "description": "Mandala marino cortado en madera, con un caballito de mar ornamentado que evoca delicadeza, fluidez y misterio oceánico.\nEstá compuesto por cuatro capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 23 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Susurro_del_Coral_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Susurro_del_Coral_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769942761389",
      "name": "Guardiana Silenciosa",
      "price": 90,
      "description": "Mandala felino tallado en madera, con patrones florales y geométricos que envuelven su silueta serena en un juego de texturas cálidas y armoniosas.\nEstá compuesto por nueve capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 30 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Guardiana_silenciosa_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Guardiana_silenciosa_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769940565735",
      "name": "Silencio de Madera",
      "price": 50,
      "description": "Mandala felino tallado en madera, de silueta serena y textura envolvente, que transmite calma y sofisticación.\nEstá compuesto por cuatro capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 39 cm x 38 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Silencio_de_madera_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Silencio_de_madera_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769801162181",
      "name": "Sapos y Culebras",
      "price": 0,
      "description": "Cartel grabado con grabadora láser sobre rodaja de tronco de madera.\nEste cartel fue creado de forma personalizada para un amigo que quería un cartel para un stand con el nombre de su grupo de música para promocionarlo.\nEl trabajo se realizó de una manera metódica, primero vectorizando el logotipo buscando que la calidad fuese lo más alta posible, y luego buscando que el quemado de la madera tuviese un toque rústico y a la vez atractivo.\nSi te interesa algo parecido ponte en contacto conmigo. Precio a convenir.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Sapos_y_culebras_pic1.jpg?raw=true"
      ],
      "category": "VARIOS",
      "family": "CARTELES",
      "isCustomizable": true
    },
    {
      "id": "1769800404573",
      "name": "Hexagono kumiko",
      "price": 25,
      "description": "Adorno de carpintería kumiko con patron Rindo Asa-no-ha. Para decorar cualquier rincón de tú casa.\nEste mismo adorno se realiza con diferentes patrones kumiko.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Hexagono_kumiko_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Hexagono_kumiko_pic2.jpg?raw=true"
      ],
      "category": "CARPINTERÍA KUMIKO",
      "family": "ADORNOS",
      "isCustomizable": true
    },
    {
      "id": "1769713140180",
      "name": "Sabiduría Compartida",
      "price": 50,
      "description": "Mandala en madera con con dos búhos entrelazados, símbolo de sabiduría y ternura, cortado con delicadeza y armonía visual.\nEstá compuesto por siete capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 39 cm x 38 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Sabiduria_compartida_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Sabiduria_compartida_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769712844031",
      "name": "Alegría Encantada",
      "price": 70,
      "description": "Mandala en madera con figura de duende festivo, adornado con corazones, estrellas y texturas delicadas que irradian alegría y ternura.\nEstá compuesto por siete capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 34 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Alegria_encantada_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Alegria_encantada_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769630384374",
      "name": "Mirada Noble",
      "price": 50,
      "description": "Mandala felino en madera, de líneas refinadas y mirada serena, que transmite elegancia, equilibrio y carácter\nEstá compuesto por ocho capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 18 cm x 39 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Mirada_Noble_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Mirada_Noble_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769629941858",
      "name": "Luz Interior",
      "price": 80,
      "description": "Mandala espiritual en madera que representa a Buda en meditación, rodeado de patrones simétricos que evocan paz, sabiduría y armonía interior.\nEstá compuesto por ocho capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 38 cm x 38 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Luz_interior_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Luz_interior_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769629562303",
      "name": "Esencia Silenciosa",
      "price": 60,
      "description": "Mandala felino en madera, con delicados patrones florales y geométricos que exaltan la gracia y el misterio del gato en una obra de arte armoniosa y envolvente.\nEstá compuesto por seis capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 30 cm x 39 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Esencia_silenciosa_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Esencia_silenciosa_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769539507076",
      "name": "Alma juguetona",
      "price": 60,
      "description": "Mandala decorativo en madera que retrata un cachorro con patrones florales y geométricos, combinando ternura y arte en una pieza de gran detalle y calidez.\nEstá compuesto por cinco capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 32 cm x 38 cm.\nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Alma_juguetona_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Alma_juguetona_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769539192400",
      "name": "Raíces Eternas",
      "price": 60,
      "description": "Mandala en madera de tilo que representa el Árbol de la Vida, con raíces y ramas entrelazadas en perfecta armonía, símbolo de conexión, crecimiento y equilibrio.\nEstá compuesto por cuatro capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 39 cm x 39 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Raices_eternas_pic1.webp?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Raices_eternas_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "MULTICAPA",
      "isCustomizable": true
    },
    {
      "id": "1769538005565",
      "name": "Dama en flor",
      "price": 60,
      "description": "Mandala cortado en madera que fusiona la belleza femenina con motivos florales, enmarcado por un diseño circular de gran delicadeza artesanal.\nEstá compuesto por seis capas de madera de tilo. \nLa imagen del salón está generada por IA las medidas correctas del mandala son 37 cm x 37 cm. \nSe puede colgar o colocar donde quieras.\nLos colores son totalmente personalizables.\n",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Dama_en_flor_pic1.jpg?raw=true",
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Dama_en_flor_pic2.png?raw=true"
      ],
      "category": "CORTE LÁSER",
      "family": "multicapa",
      "isCustomizable": true
    },
    {
      "id": "1769457006741",
      "name": "Posavasos palets",
      "price": 25,
      "description": "Juego de cinco posavasos con forma de palet industrial.\nEs un accesorio divertido para compartir con los amigos.",
      "imageUrls": [
        "https://github.com/trkumikoshop-lgtm/images/blob/main/Posavasos_palets_pic.jpg?raw=true"
      ],
      "category": "VARIOS",
      "family": "POSAVASOS",
      "isCustomizable": false
    }
  ],
  "blog": [
    {
      "id": "1",
      "title": "El nacimiento de una ilusión",
      "excerpt": "Este primer blog da nacimiento a una idea que nace de un hobby que siempre tuve, trabajar la madera.",
      "content": "\nEste primer blog no es solo un comienzo: es la apertura de una puerta que llevaba años llamando desde dentro. Una idea que nació de un hobby que siempre me acompañó en silencio, casi como un refugio íntimo: trabajar la madera.\n\nEn 2020 me adentré en la carpintería japonesa, especialmente en el kumiko. Allí descubrí algo más que una técnica. Encontré un territorio donde el tiempo se detiene, donde cada pieza exige presencia, paciencia y una entrega casi meditativa. Era mi forma de respirar en medio del ruido cotidiano.\n\nCon el paso del tiempo, mis amistades empezaron a pedirme piezas. Cada encargo lo creaba con un cariño profundo, con ese amor que solo nace cuando las manos hablan el mismo idioma que el corazón. Y al ver su reacción, entendí que quizá no era la única que encontraba belleza y calma en estas formas.\n\nEse pequeño gesto —alguien pidiendo una pieza hecha por mí— encendió una chispa. Me hizo replantearme cómo mostrar al mundo lo que ocurre en mi pequeño taller casero, ese rincón donde la madera se convierte en historia. Y así nació la idea de llevar este hobby a un nivel más alto, más consciente, más visible.\n\nPor este motivo empecé a publicar mis piezas en instagram y ahora crear esta página web. Espero con ello darle aún más visibilidad.\n\nLa adquisición a principios del 2025 de una grabadora láser me ha permitido el poder crear otro tipo de piezas en madera, las cuales podrás ver en mí colección de productos.\n\nEspero que esta andadura sea próspera y nos de grandes alegrías.\n\nUn saludo a todo el que entre en mí página web y empiece a formar parte de mí circulo de amigos.",
      "date": "1 de febrero de 2026",
      "imageUrl": "https://github.com/trkumikoshop-lgtm/images/blob/main/Blog_inicial_1.jpg?raw=true"
    }
  ]
};

export const cmsStore = {
  get: (): SiteConfig => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error al leer configuración:", e);
    }
    return DEFAULT_CONFIG;
  },
  save: (config: SiteConfig): { success: boolean, error?: string, sizeKB?: number } => {
    try {
      const json = JSON.stringify(config);
      const sizeKB = Math.round(json.length / 1024);
      
      // Intentar guardar en LocalStorage
      localStorage.setItem(STORAGE_KEY, json);
      
      // Emitir evento de actualización
      window.dispatchEvent(new CustomEvent('cms-update'));
      console.log(`✅ Web Guardada. Espacio ocupado: ${sizeKB}KB de ~5000KB.`);
      return { success: true, sizeKB };
    } catch (e: any) {
      console.error("❌ Error al guardar:", e);
      let errorMsg = "Ocurrió un error al intentar escribir en el disco del navegador.";
      
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || e.code === 22) {
        errorMsg = "LÍMITE DE ESPACIO ALCANZADO: Tienes demasiadas fotos en alta resolución. Por favor, elimina algunas fotos o redúcelas de tamaño antes de guardar.";
      }
      
      return { success: false, error: errorMsg };
    }
  }
};
