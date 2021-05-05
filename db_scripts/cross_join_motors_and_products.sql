select * from motors
cross join products
where products.Name = 'qwe' AND motors.Name = 'qwe' AND motors.Serial = 'AUF' AND products.Serial = 'AUF'