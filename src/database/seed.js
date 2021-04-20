import faker from 'faker';

import User from '../models/user.model';
import Set from '../models/set.model';
import grabProfileImage from '../utils/grabProfileImage';

const generateSeed = async () => {
  await User.deleteMany({});
  await Set.deleteMany({});

  const userIds = [];

  for (let i = 0; i < 10; i++) {
    const email = `testuser_${i}@gmail.com`;
    const name = faker.fake('{{name.firstName}} {{name.lastName}}');

    const user = new User({
      email,
      name,
      username: email.split('@')[0],
      profileImage: faker.image.avatar(),
      profileImageDefault: grabProfileImage(email),
      password: '@6991hniM'
    });
    await user.save();
    userIds.push(user._id);
  }

  const exampleCards = [];

  for (let i = 0; i < 10; i++) {
    const card = {
      term: faker.lorem.word(6),
      definition: faker.lorem.words(6),
      image: faker.image.animals()
    };
    exampleCards.push(card);
  }

  for (let i = 0; i < 100; i++) {
    const set = new Set({
      title: faker.name.title(),
      description: faker.lorem.words(8),
      userId: faker.random.arrayElement(userIds),
      isPublic: faker.datatype.boolean(),
      cards: exampleCards
    });

    await set.save();
  }
};

export default generateSeed;
