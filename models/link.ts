import { Schema, model } from 'mongoose';

const schema = new Schema({
	id: { type: String, required: true },
	link: { type: String, required: true },
	withoutAuth: { type: Boolean, required: true },
	deleteKey: { type: String, required: true }
});

global.linkSchema = global.linkSchema || model('link', schema);

export default global.linkSchema;
