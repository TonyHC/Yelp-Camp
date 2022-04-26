const Joi = require('joi');
const sanitizeHTML = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });

                if (clean !== value) {
                    return helpers.error('string.escapeHTML', { value });
                }

                return value;
            }
        }
    }
});

const CustomJoi = Joi.extend(extension);

module.exports.campgroundSchema = CustomJoi.object({
    campground: CustomJoi.object({
        title: CustomJoi.string().required().escapeHTML(),
        price: CustomJoi.number().required().min(0),
        location: CustomJoi.string().required().escapeHTML(),
        description: CustomJoi.string().required().escapeHTML()
    }),
    deleteImages: CustomJoi.array()
});

module.exports.reviewSchema = CustomJoi.object({
    review: CustomJoi.object({
        rating: CustomJoi.number().required().min(0).max(5),
        content: CustomJoi.string().required().escapeHTML()
    }).required()
});