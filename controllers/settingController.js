const SiteSetting = require('../models/SiteSetting');

// Helper to ensure a single SiteSetting doc exists
const getOrCreateSettings = async () => {
  let settings = await SiteSetting.findOne();
  if (!settings) {
    settings = await SiteSetting.create({});
  }
  return settings;
};

// PUBLIC: GET SITE SETTINGS
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// ADMIN: UPDATE SITE SETTINGS
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await getOrCreateSettings();
    const data = req.body;

    const allowedFields = [
      'companyName',
      'logoUrl',
      'faviconUrl',
      'tagline',
      'phone',
      'whatsappNumber',
      'email',
      'address',
      'googleMapsEmbedUrl',
      'heroHeadline',
      'heroSubtitle',
      'heroBannerUrl',
      'heroCtaText',
      'promoBannerText',
      'aboutIntro',
      'aboutStory',
      'aboutMission',
      'aboutVision',
      'footerText',
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        settings[field] = data[field];
      }
    });

    if (data.socialLinks) {
      settings.socialLinks = { ...settings.socialLinks, ...data.socialLinks };
    }

    if (data.policies) {
      settings.policies = { ...settings.policies, ...data.policies };
    }

    if (data.whyChooseUs) {
      settings.whyChooseUs = typeof data.whyChooseUs === 'string' ? JSON.parse(data.whyChooseUs) : data.whyChooseUs;
    }

    if (data.faqs) {
      settings.faqs = typeof data.faqs === 'string' ? JSON.parse(data.faqs) : data.faqs;
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Site settings and content updated successfully!',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
