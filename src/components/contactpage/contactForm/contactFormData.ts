export interface ContactItem {
  icon: string;
  label: {
    en: string;
    hi: string;
  };
  value: {
    en: string;
    hi: string;
  };
  href?: string;
}

export interface SubjectOption {
  value: string;
  label: {
    en: string;
    hi: string;
  };
}

export interface ContactFormDataProps {
  props: {
    sectionHeading: {
      en: string;
      hi: string;
    };
    contactItems: ContactItem[];
    formHeading: {
      en: string;
      hi: string;
    };
    formDescription: {
      en: string;
      hi: string;
    };
    successHeading: {
      en: string;
      hi: string;
    };
    successDescription: {
      en: string;
      hi: string;
    };
    successButtonText: {
      en: string;
      hi: string;
    };
    nameLabel: {
      en: string;
      hi: string;
    };
    namePlaceholder: {
      en: string;
      hi: string;
    };
    emailLabel: {
      en: string;
      hi: string;
    };
    emailPlaceholder: {
      en: string;
      hi: string;
    };
    subjectLabel: {
      en: string;
      hi: string;
    };
    subjectOptions: SubjectOption[];
    messageLabel: {
      en: string;
      hi: string;
    };
    messagePlaceholder: {
      en: string;
      hi: string;
    };
    submitButtonText: {
      en: string;
      hi: string;
    };
  };
}

export const defaultContactFormData: ContactFormDataProps = {
  props: {
    sectionHeading: {
      en: "Reach Out",
      hi: "संपर्क करें"
    },
    contactItems: [
      {
        icon: "Mail",
        label: {
          en: "Email",
          hi: "ईमेल"
        },
        value: {
          en: "peekeepermail@gmail.com",
          hi: "peekeepermail@gmail.com"
        },
        href: "mailto:peekeepermail@gmail.com"
      },
      {
        icon: "Phone",
        label: {
          en: "Phone",
          hi: "फोन"
        },
        value: {
          en: "+91 9810159604",
          hi: "+91 9810159604"
        },
        href: "tel:+919810159604"
      },
      {
        icon: "MapPin",
        label: {
          en: "Studio",
          hi: "स्टूडियो"
        },
        value: {
          en: "8A, Excellency Trade Square, Govind Marg, Rajapark Jaipur 302004",
          hi: "8A, एक्सीलेंसी ट्रेड स्क्वायर, गोविंद मार्ग, राजापार्क जयपुर 302004"
        }
      }
    ],
    formHeading: {
      en: "Send an Inquiry",
      hi: "पूछताछ भेजें"
    },
    formDescription: {
      en: "Fill out the form below and we'll get back to you within 24 hours.",
      hi: "नीचे दिया गया फॉर्म भरें और हम 24 घंटे के भीतर आपसे संपर्क करेंगे।"
    },
    successHeading: {
      en: "Message Received",
      hi: "संदेश प्राप्त हुआ"
    },
    successDescription: {
      en: "Thank you for reaching out. A design consultant will contact you shortly to discuss your vision.",
      hi: "संपर्क करने के लिए धन्यवाद। एक डिज़ाइन सलाहकार जल्द ही आपकी दृष्टि पर चर्चा करने के लिए आपसे संपर्क करेगा।"
    },
    successButtonText: {
      en: "Send Another Message",
      hi: "एक और संदेश भेजें"
    },
    nameLabel: {
      en: "Your Name",
      hi: "आपका नाम"
    },
    namePlaceholder: {
      en: "John Doe",
      hi: "जॉन डो"
    },
    emailLabel: {
      en: "Email Address",
      hi: "ईमेल पता"
    },
    emailPlaceholder: {
      en: "john@example.com",
      hi: "john@example.com"
    },
    subjectLabel: {
      en: "What can we help with?",
      hi: "हम आपकी क्या मदद कर सकते हैं?"
    },
    subjectOptions: [
      {
        value: "",
        label: {
          en: "Select an option",
          hi: "एक विकल्प चुनें"
        }
      },
      {
        value: "bespoke",
        label: {
          en: "Bespoke Furniture Design",
          hi: "कस्टम फर्नीचर डिजाइन"
        }
      },
      {
        value: "interior",
        label: {
          en: "Full Interior Consultation",
          hi: "पूर्ण आंतरिक परामर्श"
        }
      },
      {
        value: "order",
        label: {
          en: "Order Status & Support",
          hi: "ऑर्डर स्थिति और समर्थन"
        }
      },
      {
        value: "trade",
        label: {
          en: "Trade & Partnership",
          hi: "व्यापार और साझेदारी"
        }
      }
    ],
    messageLabel: {
      en: "Your Message",
      hi: "आपका संदेश"
    },
    messagePlaceholder: {
      en: "Tell us about your space...",
      hi: "हमें अपने स्थान के बारे में बताएं..."
    },
    submitButtonText: {
      en: "Send Message",
      hi: "संदेश भेजें"
    }
  }
};
