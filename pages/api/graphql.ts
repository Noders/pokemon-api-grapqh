import { ApolloServer, gql, makeExecutableSchema } from "apollo-server-micro";
import {
  getPokemonById,
  getPokemonsByNames,
} from "@fforres/pokemon-local-database";
import { PokemonType } from "@fforres/pokemon-local-database/build/main/types";

type Pokemon = {
  id: string;
  nombre: string;
  numero: number;
  imagen: string;
  tipos: string[];
};

const typeDefs = gql`
  type Query {
    pokemones(limit: Int): [Pokemon!]!
    pokemonById(id: Int): Pokemon
  }
  type Pokemon {
    id: String
    nombre: String
    numero: Int
    imagen: String
    tipos: [String!]!
  }
`;

const toGraphQLPokemon = (pokemon: PokemonType): Pokemon => {
  const parsedId = pokemon.id.toString().padStart(3, "0");
  return {
    id: parsedId,
    imagen: `https://raw.githubusercontent.com/fforres/pokemon-local-database/master/src/data/thumbnails/${parsedId}.png`,
    nombre: pokemon.name.english,
    numero: pokemon.id,
    tipos: pokemon.type,
  };
};

const resolvers = {
  Query: {
    pokemones: (_: any, { limit }: { limit: number }): Pokemon[] => {
      const pokemones = getPokemonsByNames();
      const limitedPokemons = limit ? pokemones.slice(0, limit) : pokemones;
      const graphqlPokemons = limitedPokemons.map((pokemon) =>
        toGraphQLPokemon(pokemon)
      );
      return graphqlPokemons;
    },
    pokemonById: (_: any, { id }: { id: number }): Pokemon | null => {
      const pokemon = getPokemonById(id);
      if (!pokemon) {
        return null;
      }
      return toGraphQLPokemon(pokemon);
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default new ApolloServer({ schema }).createHandler({
  path: "/api/graphql",
});
