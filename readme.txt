- use npm i to install dependcies
- with nodemon use "npm i nodemon --save-dev"
- you can either run with 'npm start' or 'npm run api', I recommend the latter


- what is your resources that you need to protect?
	- food recipes, something like a note

- đăng nhập luôn sẽ là 2 bước = otp email + randomize otp, hash otp và delete otp sau khi thành công (2) x
- password đủ độ dài + hashing passwords in database (2) x
- giới hạn số lượng đăng nhập sau n lần login sai (1) x
- sql injection, nói là sp dùng nosql nên ko lo vấn đề sql injection (1) x
- send link throught email to validate account + using jwt to sign (2) x
- cannot login if not validated (1) x
- tick rate block, this prevent ddos (1) x
- nosql injection block, let it be string (1) x
- hide data in the body using post and get (1) x
- hide userid to search for recipe in the headers or encrypt in the url (1) x

- splitting the website into 2 side FE and BE

- after validate user must change their password one again or after login the 1st time must change password (1)
- cookie and session setup to block (1)
- mã hóa dữ liệu -> token để xác thực quyền truy cập (admin level and normal level) (1)
- history log (1)
