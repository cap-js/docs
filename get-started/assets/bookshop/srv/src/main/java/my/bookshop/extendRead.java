@AfterRead(entity = "Orders", serviceName = SERVICE_NAME)
public ReadResponse afterreadOrder (ReadRequest rr, ReadResponseAccessor response, ExtensionHelper eh) {
    EntityData ed = response.getEntityData();
    EntityData edNew = EntityData.getBuilder(ed).addElement("quantity", 1000).buildEntityData("Orders");
    return ReadResponse.setSuccess().setData(edNew).response();
}