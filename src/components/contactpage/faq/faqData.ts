export interface FAQItem {
  q: {
    en: string;
    hi: string;
  };
  a: {
    en: string;
    hi: string;
  };
}

export interface FAQDataProps {
  props: {
    label: {
      en: string;
      hi: string;
    };
    heading: {
      en: string;
      hi: string;
    };
    questions: FAQItem[];
  };
}

export const defaultFaqData: FAQDataProps = {
  props: {
    label: {
      en: "Common Questions",
      hi: "सामान्य प्रश्न"
    },
    heading: {
      en: "Need a quick answer?",
      hi: "एक त्वरित उत्तर की आवश्यकता है?"
    },
    questions: [
      {
        q: {
          en: "Where is your furniture store located?",
          hi: "आपके फर्नीचर स्टोर कहाँ स्थित है?"
        },
        a: {
          en: "Our premium furniture showroom is located in Raja Park, Jaipur. You are always welcome to visit us, check the quality of our solid wood, and try out our furniture in person before buying.",
          hi: "हमारा प्रीमियम फर्नीचर शोरूम राजा पार्क, जयपुर में स्थित है। आप हमेशा हमसे मिलने, हमारी ठोस लकड़ी की गुणवत्ता की जांच करने और खरीदने से पहले हमारे फर्नीचर को व्यक्तिगत रूप से आज़माने के लिए स्वागत करते हैं।"
        }
      },
      {
        q: {
          en: "Do you deliver furniture outside Jaipur?",
          hi: "क्या आप जयपुर के बाहर फर्नीचर वितरित करते हैं?"
        },
        a: {
          en: "Yes, absolutely! While our main store is in Jaipur, we safely deliver our home furniture all across Rajasthan. Whether you live in Jodhpur, Udaipur, or any other city, we will bring your order right to your doorstep.",
          hi: "हाँ, बिल्कुल! जबकि हमारा मुख्य स्टोर जयपुर में है, हम पूरे राजस्थान में हमारे घर के फर्नीचर को सुरक्षित रूप से वितरित करते हैं। चाहे आप जोधपुर, उदयपुर, या किसी अन्य शहर में रहते हों, हम आपका ऑर्डर सीधे आपके दरवाजे पर लाएंगे।"
        }
      },
      {
        q: {
          en: "Can I get customized furniture for my home?",
          hi: "क्या मुझे मेरे घर के लिए अनुकूलित फर्नीचर मिल सकता है?"
        },
        a: {
          en: "Yes, we love making custom furniture! If you have a specific design, size, or color in mind, just let us know. We will create the perfect sofa, bed, or dining table that fits your home perfectly.",
          hi: "हाँ, हम कस्टम फर्नीचर बनाना पसंद करते हैं! यदि आपके मन में एक विशिष्ट डिजाइन, आकार, या रंग है, तो बस हमें बताएं। हम एकदम सही सोफा, बिस्तर, या डाइनिंग टेबल बनाएंगे जो आपके घर में पूरी तरह से फिट बैठता है।"
        }
      },
      {
        q: {
          en: "What type of wood do you use for your furniture?",
          hi: "आप अपने फर्नीचर के लिए किस प्रकार की लकड़ी का उपयोग करते हैं?"
        },
        a: {
          en: "We mainly use high-quality solid wood, like pure Sheesham and Teak. These woods are very strong, look beautiful, and are naturally perfect for Rajasthan's hot and dry climate.",
          hi: "हम मुख्य रूप से उच्च गुणवत्ता वाली ठोस लकड़ी का उपयोग करते हैं, जैसे कि शुद्ध शीशम और सागौन। ये लकड़ियाँ बहुत मजबूत होती हैं, सुंदर दिखती हैं, और स्वाभाविक रूप से राजस्थान की गर्म और शुष्क जलवायु के लिए एकदम सही हैं।"
        }
      },
      {
        q: {
          en: "Is it safe to buy heavy furniture online from your website?",
          hi: "क्या आपकी वेबसाइट से ऑनलाइन भारी फर्नीचर खरीदना सुरक्षित है?"
        },
        a: {
          en: "Yes, it is 100% safe. We use strong, multi-layer packaging to pack every item. Our trusted delivery team handles heavy solid wood furniture with great care so it reaches your home without a single scratch.",
          hi: "हाँ, यह 100% सुरक्षित है। हम हर आइटम को पैक करने के लिए मजबूत, बहु-परत पैकेजिंग का उपयोग करते हैं। हमारी विश्वसनीय डिलीवरी टीम भारी ठोस लकड़ी के फर्नीचर को बड़ी सावधानी से संभालती है ताकि यह बिना किसी खरोंच के आपके घर तक पहुंच सके।"
        }
      },
      {
        q: {
          en: "How should I clean and take care of my solid wood furniture?",
          hi: "मुझे अपने ठोस लकड़ी के फर्नीचर को कैसे साफ करना और देखभाल करना चाहिए?"
        },
        a: {
          en: "It is very simple. Just wipe your furniture regularly with a soft, dry cloth. To keep the wood looking new for years, try to keep it away from direct sunlight and avoid putting hot mugs directly on the wooden surface.",
          hi: "यह बहुत आसान है। बस अपने फर्नीचर को नियमित रूप से एक मुलायम, सूखे कपड़े से पोंछें। लकड़ी को वर्षों तक नया दिखने के लिए, इसे सीधे धूप से दूर रखने की कोशिश करें और गर्म मग को सीधे लकड़ी की सतह पर रखने से बचें।"
        }
      }
    ]
  }
};
