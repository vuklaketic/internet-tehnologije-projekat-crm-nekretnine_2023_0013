CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");--> statement-breakpoint
CREATE INDEX "properties_type_idx" ON "properties" USING btree ("type");--> statement-breakpoint
CREATE INDEX "properties_status_idx" ON "properties" USING btree ("status");