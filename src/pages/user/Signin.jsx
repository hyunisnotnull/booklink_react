import React from 'react';


const Signin = () => {
  return (
<>
<form action="http://localhost:3000/signin" method="post">
<input type="text" name="u_id" placeholder="id"/>
<input type="text" name="u_pw" placeholder="pw"/>
<input type="submit"/>
</form>
</>
  );
};

export default Signin;
