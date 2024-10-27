const mongoose = require('mongoose');

const ebikeSchema = new mongoose.Schema({
  generalInfo: {
    brand: {
      type: String,
      required: true
    },
    manufacturer: {
      name: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      website: {
        type: String,
        required: true
      }
    },
    soldBy: {
      type: String,
      required: true
    },
    customerCare: {
      phone: {
        type: String,
        required: true
      }
    },
    countryOfOrigin: {
      type: String,
      required: true
    }
  },
  productDetails: {
    productType: {
      type: String, // e.g., "E Bikes"
      required: true
    },
    color: {
      type: String, // e.g., "Yellow"
      required: true
    },
    frameMaterial: {
      type: String, // e.g., "Carbon Steel"
      required: true
    },
    hazardousMaterial: {
      type: Boolean,
      default: false
    },
    flammability: {
      type: Boolean,
      default: false
    },
    packOf: {
      type: Number,
      default: 1
    },
    features: {
      seatAdjustments: {
        type: Boolean,
        default: true
      },
      handlebarAdjustments: {
        type: Boolean,
        default: true
      },
      transportWheels: {
        type: Boolean,
        default: true
      },
      detachableSeat: {
        type: Boolean,
        default: false
      }
    }
  },
  usageDetails: {
    numberOfBatteries: {
      type: Number,
      required: true
    },
    batteryType: {
      type: String, // e.g., "Lithium-ion (Li-ion)"
      required: true
    },
    rechargeable: {
      type: Boolean,
      default: true
    },
    serviceOffered: {
      type: String,
      required: true
    },
    minimumAge: {
      type: Number,
      required: true
    },
    loadLimit: {
      type: Number, // e.g., 120 (kg)
      required: true
    },
    additionalFeatures: {
      bell: {
        type: Boolean,
        default: true
      },
      light: {
        type: Boolean,
        default: true
      },
      footRest: {
        type: Boolean,
        default: true
      },
      headlight: {
        type: Boolean,
        default: true
      }
    }
  },
  dimensions: {
    height: {
      type: String, // e.g., "102 cm"
      required: true
    },
    length: {
      type: String, // e.g., "185 cm"
      required: true
    },
    width: {
      type: String, // e.g., "24 cm"
      required: true
    },
    netWeight: {
      type: String, // e.g., "21 kg"
      required: true
    }
  },
  pricing: {
    price: {
      type: Number, // e.g., 49999 (in currency)
      required: true
    },
    discount: {
      type: Number, // e.g., 10 (percentage)
      default: 0
    },
    netQuantity: {
      type: Number,
      default: 1
    }
  },
  addedDate: {
    type: Date,
    default: Date.now
  }
});

// Export the model
module.exports = mongoose.model('Ebike', ebikeSchema);
