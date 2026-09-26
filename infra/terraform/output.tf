output "vpc_id" {
  description = "VPC ID."
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs to use in the SAM Lambda VpcConfig."
  value       = [aws_subnet.private_1a.id, aws_subnet.private_1b.id]
}

output "lambda_security_group_id" {
  description = "Lambda security group ID to use in the SAM Lambda VpcConfig."
  value       = aws_security_group.lambda_sg.id
}

output "rds_address" {
  description = "RDS hostname for the application connection string."
  value       = aws_db_instance.postgres.address
}

output "rds_port" {
  description = "RDS PostgreSQL port."
  value       = aws_db_instance.postgres.port
}

output "rds_database_name" {
  description = "Application database name."
  value       = aws_db_instance.postgres.db_name
}
