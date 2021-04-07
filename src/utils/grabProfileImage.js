const grabProfileImage = (email) => {
  const name = email.split('@')[0];

  return `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${name}`;
};

export default grabProfileImage;
