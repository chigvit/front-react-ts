import { User } from "../model/types";

export const UserCard = ({ id, name }: User) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>ID: {id}</p>
    </div>
  );
};
