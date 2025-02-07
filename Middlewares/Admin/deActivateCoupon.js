export const deactivateCouponMiddleware = (schema) => {
    schema.pre('save', function (next) {
      if (this.usageLimit !== null && this.usedCount === this.usageLimit) {
        this.isActive = false; 
      }
      next();
    });
  
    // Middleware for updates to deactivate coupon instantly when usedCount equals usageLimit
    schema.pre('findOneAndUpdate', async function (next) {
      const update = this.getUpdate();
  
      if (update.$inc && update.$inc.usedCount) {
        const coupon = await this.model.findOne(this.getQuery());
        const newUsedCount = (coupon.usedCount || 0) + update.$inc.usedCount;
  
        if (coupon.usageLimit !== null && newUsedCount === coupon.usageLimit) {
          this.set({ isActive: false });
        }
      }
      next();
    });
  };
  