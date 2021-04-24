import faker from 'faker';

import User from '../models/user.model';
import Set from '../models/set.model';
import Card from '../models/card.model';
import grabProfileImage from '../utils/grabProfileImage';

const generateSeed = async () => {
  await User.deleteMany({});
  await Set.deleteMany({});
  await Card.deleteMany({});

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

  for (let i = 0; i < 100; i++) {
    const set = new Set({
      title: faker.name.title(),
      description: faker.lorem.words(8),
      userId: faker.random.arrayElement(userIds),
      isPublic: faker.datatype.boolean()
    });

    await set.save();

    for (let j = 0; j < 10; j++) {
      const card = new Card({
        term: faker.lorem.word(),
        definition: faker.lorem.words(8),
        imageUrl: `https://picsum.photos/id/${faker.datatype.number(300)}/200/300`,
        setId: set._id
      });

      await card.save();
    }
  }
};

export default generateSeed;
