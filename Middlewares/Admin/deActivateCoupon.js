// couponMiddleware.js
export const deactivateCouponMiddleware = (schema) => {
    // Middleware to check and deactivate coupon on save
    schema.pre('save', function (next) {
      if (this.usageLimit !== null && this.usedCount === this.usageLimit) {
        this.isActive = false; // Set isActive to false if usedCount equals usageLimit
      }
      next();
    });
  
    // Middleware for updates to deactivate coupon instantly when usedCount equals usageLimit
    schema.pre('findOneAndUpdate', async function (next) {
      const update = this.getUpdate();
  
      // Check if usedCount is being incremented
      if (update.$inc && update.$inc.usedCount) {
        const coupon = await this.model.findOne(this.getQuery());
        const newUsedCount = (coupon.usedCount || 0) + update.$inc.usedCount;
  
        // If newUsedCount equals usageLimit, deactivate the coupon
        if (coupon.usageLimit !== null && newUsedCount === coupon.usageLimit) {
          this.set({ isActive: false });
        }
      }
      next();
    });
  };
  