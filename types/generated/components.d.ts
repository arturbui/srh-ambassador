import type { Schema, Struct } from '@strapi/strapi';

export interface ComponentsMaterial extends Struct.ComponentSchema {
  collectionName: 'components_components_materials';
  info: {
    displayName: 'Material';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
    organizerProvided: Schema.Attribute.Boolean;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'components.material': ComponentsMaterial;
    }
  }
}
