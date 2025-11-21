export interface TaxonomyInfo {
  animalType: string;
  conservationStatus: string;
  estimatedPopulation: string;
  habitat: string;
  estimatedLifespan: string;
}

const taxonomyDatabase: Record<string, TaxonomyInfo> = {
  "palawan binturong": {
    animalType: "Mammal",
    conservationStatus: "Vulnerable",
    estimatedPopulation: "Less than 2,500",
    habitat: "Palawan forests",
    estimatedLifespan: "15-20 years",
  },
  "philippine mouse-deer": {
    animalType: "Mammal",
    conservationStatus: "Endangered",
    estimatedPopulation: "Unknown, declining",
    habitat: "Thickets and dense forests",
    estimatedLifespan: "10-12 years",
  },
  "calamian deer": {
    animalType: "Mammal",
    conservationStatus: "Endangered",
    estimatedPopulation: "Fewer than 1,000",
    habitat: "Calamian Islands grasslands and forests",
    estimatedLifespan: "10-15 years",
  },
  "gray's monitor lizard": {
    animalType: "Reptile",
    conservationStatus: "Vulnerable",
    estimatedPopulation: "Unknown",
    habitat: "Lowland forests of Luzon",
    estimatedLifespan: "10-12 years",
  },
  "cloud rat": {
    animalType: "Rodent",
    conservationStatus: "Endangered",
    estimatedPopulation: "Unknown",
    habitat: "Northern Luzon montane forests",
    estimatedLifespan: "3-5 years",
  },
  "visayan warty pig": {
    animalType: "Mammal",
    conservationStatus: "Critically Endangered",
    estimatedPopulation: "Fewer than 300",
    habitat: "Visayan islands forests",
    estimatedLifespan: "8-10 years",
  },
  "southern pig-tailed macaque": {
    animalType: "Mammal",
    conservationStatus: "Vulnerable",
    estimatedPopulation: "Decreasing trend",
    habitat: "Tropical and swamp forests",
    estimatedLifespan: "20-25 years",
  },
  "cotton-headed tamarin": {
    animalType: "Mammal",
    conservationStatus: "Critically Endangered",
    estimatedPopulation: "Less than 7,000",
    habitat: "Tropical forests in Colombia",
    estimatedLifespan: "13-18 years",
  },
  "matschie's tree kangaroo": {
    animalType: "Mammal",
    conservationStatus: "Endangered",
    estimatedPopulation: "Less than 2,500",
    habitat: "New Guinea's mountain forests",
    estimatedLifespan: "14-20 years",
  }
};

export function getTaxonomyInfo(species: string): TaxonomyInfo {
  const info = taxonomyDatabase[species.toLowerCase()];
  return (
    info || {
      animalType: "Unknown",
      conservationStatus: "Unknown",
      estimatedPopulation: "Unknown",
      habitat: "Unknown",
      estimatedLifespan: "Unknown"
    }
  );
}
