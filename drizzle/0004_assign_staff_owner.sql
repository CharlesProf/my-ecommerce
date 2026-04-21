-- Assign the user charles.wilbert7777@gmail.com as staff for the owner charles.wilbert2408@gmail.com.

INSERT INTO staff (user_id, owner_id)
SELECT staff_user.id, owner_user.id
FROM users AS staff_user
JOIN users AS owner_user ON owner_user.email = 'charles.wilbert2408@gmail.com'
WHERE staff_user.email = 'charles.wilbert7777@gmail.com'
  AND NOT EXISTS (
    SELECT 1
    FROM staff
    WHERE user_id = staff_user.id
      AND owner_id = owner_user.id
  );
