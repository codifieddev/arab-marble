export const defaultTestimonialsData = {
  props: {
    badge: {
      en: "Reviews",
      hi: "समीक्षाएँ",
    },
    title: {
      en: "Loved by Thousands",
      hi: "हजारों द्वारा पसंद किया गया",
    }
  },
  content: [
    {
      id: "review_1",
      type: "testimonial-item",
      props: {
        name: { en: "Sarah Jenkins", hi: "सारा जेनकिंस" },
        role: { en: "Interior Designer", hi: "इंटीरियर डिज़ाइनर" },
        quote: { 
          en: "The quality of Peekeeper furniture is absolutely stunning. My clients are always thrilled with the sculptural beauty and comfort.", 
          hi: "नेस्टक्राफ्ट फर्नीचर की गुणवत्ता बिल्कुल आश्चर्यजनक है। मेरे ग्राहक हमेशा मूर्तिकला सुंदरता और आराम से रोमांचित होते हैं।" 
        },
        rating: { type: "number", value: 5 }
      }
    },
    {
      id: "review_2",
      type: "testimonial-item",
      props: {
        name: { en: "Michael Chen", hi: "माइकल चेन" },
        role: { en: "Homeowner", hi: "घर के मालिक" },
        quote: { 
          en: "Transformative designs that actually feel lived-in. The oakwood dining table completely changed the aesthetic of our home.", 
          hi: "परिवर्तनकारी डिजाइन जो वास्तव में रहने योग्य लगते हैं। ओकवुड डाइनिंग टेबल ने हमारे घर के सौंदर्यशास्त्र को पूरी तरह से बदल दिया।" 
        },
        rating: { type: "number", value: 5 }
      }
    },
    {
      id: "review_3",
      type: "testimonial-item",
      props: {
        name: { en: "Elena Rostova", hi: "एलेना रोस्टोवा" },
        role: { en: "Architect", hi: "वास्तुकार" },
        quote: { 
          en: "I regularly specify Peekeeper for my high-end residential projects. The craftsmanship and attention to detail are unparalleled.", 
          hi: "मैं नियमित रूप से अपनी उच्च-अंत आवासीय परियोजनाओं के लिए नेस्टक्राफ्ट निर्दिष्ट करता हूं। शिल्प कौशल और विस्तार पर ध्यान अद्वितीय है।" 
        },
        rating: { type: "number", value: 5 }
      }
    }
  ]
};
