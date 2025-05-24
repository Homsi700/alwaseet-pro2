CREATE TABLE Roles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL
);

CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    FirstName NVARCHAR(100) NULL,
    LastName NVARCHAR(100) NULL,
    PhoneNumber NVARCHAR(50) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    LastLoginDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_Users_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Users_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

ALTER TABLE Roles
ADD CONSTRAINT FK_Roles_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION;
ALTER TABLE Roles
ADD CONSTRAINT FK_Roles_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION;

CREATE TABLE UserRoles (
    UserId UNIQUEIDENTIFIER NOT NULL,
    RoleId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_UserRoles PRIMARY KEY (UserId, RoleId),
    CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleId) REFERENCES Roles(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE Warehouses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL UNIQUE,
    Code NVARCHAR(50) NULL UNIQUE,
    Location NVARCHAR(MAX) NULL,
    StorageCapacity NVARCHAR(255) NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_Warehouses_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Warehouses_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE Categories (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Code NVARCHAR(50) NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,
    ParentCategoryId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_Categories_ParentCategory FOREIGN KEY (ParentCategoryId) REFERENCES Categories(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Categories_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Categories_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE ContactGroups (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_ContactGroups_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_ContactGroups_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE Currencies (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CurrencyCode NVARCHAR(10) NOT NULL UNIQUE,
    CurrencyName NVARCHAR(100) NOT NULL,
    Symbol NVARCHAR(10) NULL,
    ExchangeRate DECIMAL(18, 6) NOT NULL DEFAULT 1.000000,
    IsBaseCurrency BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_Currencies_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Currencies_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE AccountTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    NormalBalance NVARCHAR(10) NOT NULL,
    CONSTRAINT CK_AccountTypes_NormalBalance CHECK (NormalBalance IN ('Debit', 'Credit'))
);

CREATE TABLE Accounts (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AccountNumber NVARCHAR(50) NOT NULL UNIQUE,
    AccountName NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    AccountTypeId UNIQUEIDENTIFIER NOT NULL,
    ParentAccountId UNIQUEIDENTIFIER NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    AllowManualEntries BIT NOT NULL DEFAULT 1,
    DefaultCurrencyId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_Accounts_AccountType FOREIGN KEY (AccountTypeId) REFERENCES AccountTypes(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Accounts_ParentAccount FOREIGN KEY (ParentAccountId) REFERENCES Accounts(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Accounts_Currency FOREIGN KEY (DefaultCurrencyId) REFERENCES Currencies(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Accounts_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Accounts_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE Contacts (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ContactType NVARCHAR(50) NOT NULL,
    Name NVARCHAR(255) NOT NULL,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    TaxNumber NVARCHAR(100) NULL,
    CreditLimit DECIMAL(18, 4) NULL DEFAULT 0.00,
    PreferredPaymentTerms NVARCHAR(255) NULL,
    AssignedSalespersonId UNIQUEIDENTIFIER NULL,
    DefaultAccountId UNIQUEIDENTIFIER NULL,
    ContactGroupId UNIQUEIDENTIFIER NULL,
    Address_Street NVARCHAR(MAX) NULL,
    Address_City NVARCHAR(255) NULL,
    Address_StateOrProvince NVARCHAR(255) NULL,
    Address_PostalCode NVARCHAR(50) NULL,
    Address_Country NVARCHAR(100) NULL,
    PhoneNumber NVARCHAR(50) NULL,
    MobileNumber NVARCHAR(50) NULL,
    Email NVARCHAR(255) NULL,
    FaxNumber NVARCHAR(50) NULL,
    Website NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT CK_Contacts_ContactType CHECK (ContactType IN ('Customer', 'Supplier', 'Both')),
    CONSTRAINT FK_Contacts_AssignedSalesperson FOREIGN KEY (AssignedSalespersonId) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Contacts_DefaultAccount FOREIGN KEY (DefaultAccountId) REFERENCES Accounts(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Contacts_ContactGroup FOREIGN KEY (ContactGroupId) REFERENCES ContactGroups(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Contacts_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Contacts_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE Products (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    NameAr NVARCHAR(255) NOT NULL,
    NameEn NVARCHAR(255) NULL,
    Sku NVARCHAR(100) NOT NULL UNIQUE,
    Barcode NVARCHAR(100) NULL UNIQUE,
    Description NVARCHAR(MAX) NULL,
    CategoryId UNIQUEIDENTIFIER NULL,
    DefaultPurchasePrice DECIMAL(18, 4) NOT NULL DEFAULT 0.00,
    DefaultSalesPrice DECIMAL(18, 4) NOT NULL DEFAULT 0.00,
    MinStockLevel DECIMAL(18, 4) NOT NULL DEFAULT 0.00,
    MaxStockLevel DECIMAL(18, 4) NULL,
    DefaultSupplierId UNIQUEIDENTIFIER NULL,
    ExpiryDateRequired BIT NOT NULL DEFAULT 0,
    IsService BIT NOT NULL DEFAULT 0,
    IsKit BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_Products_Category FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Products_DefaultSupplier FOREIGN KEY (DefaultSupplierId) REFERENCES Contacts(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Products_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Products_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE ProductUnits (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ProductId UNIQUEIDENTIFIER NOT NULL,
    UnitName NVARCHAR(100) NOT NULL,
    ConversionFactor DECIMAL(18, 4) NOT NULL DEFAULT 1.00,
    IsBaseUnit BIT NOT NULL DEFAULT 0,
    Barcode NVARCHAR(100) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_ProductUnits_Product FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_ProductUnits_Product_UnitName UNIQUE (ProductId, UnitName)
    -- The UQ_ProductUnits_Product_Barcode was causing an issue. It's better to create a filtered index for this.
    -- CONSTRAINT UQ_ProductUnits_Product_Barcode UNIQUE (ProductId, Barcode) WHERE Barcode IS NOT NULL,
);

-- Creating a filtered unique index for ProductUnits Barcode
CREATE UNIQUE NONCLUSTERED INDEX UQ_ProductUnits_Product_Barcode
ON ProductUnits (ProductId, Barcode)
WHERE Barcode IS NOT NULL;

ALTER TABLE ProductUnits
ADD CONSTRAINT FK_ProductUnits_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION;
ALTER TABLE ProductUnits
ADD CONSTRAINT FK_ProductUnits_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION;

CREATE TABLE ProductImages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ProductId UNIQUEIDENTIFIER NOT NULL,
    ImageUrl NVARCHAR(MAX) NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    Caption NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_ProductImages_Product FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE CASCADE,
    CONSTRAINT FK_ProductImages_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_ProductImages_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_Username ON Users(Username);

CREATE INDEX IX_UserRoles_RoleId ON UserRoles(RoleId);
CREATE INDEX IX_UserRoles_UserId ON UserRoles(UserId);

CREATE INDEX IX_Warehouses_Code ON Warehouses(Code);

CREATE INDEX IX_Categories_ParentCategoryId ON Categories(ParentCategoryId);
CREATE INDEX IX_Categories_Code ON Categories(Code);

CREATE INDEX IX_Products_CategoryId ON Products(CategoryId);
CREATE INDEX IX_Products_DefaultSupplierId ON Products(DefaultSupplierId);
CREATE INDEX IX_Products_Sku ON Products(Sku);
CREATE INDEX IX_Products_Barcode ON Products(Barcode);
CREATE INDEX IX_Products_NameAr ON Products(NameAr);

CREATE INDEX IX_ProductUnits_ProductId ON ProductUnits(ProductId);
-- Filtered index already created above
-- CREATE INDEX IX_ProductUnits_Barcode ON ProductUnits(Barcode) WHERE Barcode IS NOT NULL;

CREATE INDEX IX_ProductImages_ProductId ON ProductImages(ProductId);

CREATE INDEX IX_Contacts_ContactGroupId ON Contacts(ContactGroupId);
CREATE INDEX IX_Contacts_AssignedSalespersonId ON Contacts(AssignedSalespersonId);
CREATE INDEX IX_Contacts_DefaultAccountId ON Contacts(DefaultAccountId);
CREATE INDEX IX_Contacts_Code ON Contacts(Code);
CREATE INDEX IX_Contacts_Email ON Contacts(Email);
CREATE INDEX IX_Contacts_ContactType ON Contacts(ContactType);

CREATE INDEX IX_Currencies_CurrencyCode ON Currencies(CurrencyCode);

CREATE INDEX IX_Accounts_AccountTypeId ON Accounts(AccountTypeId);
CREATE INDEX IX_Accounts_ParentAccountId ON Accounts(ParentAccountId);
CREATE INDEX IX_Accounts_DefaultCurrencyId ON Accounts(DefaultCurrencyId);
CREATE INDEX IX_Accounts_AccountNumber ON Accounts(AccountNumber);

CREATE TABLE InventoryTransactionTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Multiplier INT NOT NULL
);

INSERT INTO InventoryTransactionTypes (Name, Multiplier) VALUES
('PurchaseReceipt', 1),
('SalesShipment', -1),
('TransferOut', -1),
('TransferIn', 1),
('AdjustmentIncrease', 1),
('AdjustmentDecrease', -1),
('SalesReturnReceive', 1),
('PurchaseReturnShipment', -1),
('StocktakeGain', 1),
('StocktakeLoss', -1),
('OpeningStock', 1);

CREATE TABLE InventoryAdjustmentReasons (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Reason NVARCHAR(255) NOT NULL UNIQUE,
    IsPositiveAdjustment BIT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_InventoryAdjustmentReasons_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryAdjustmentReasons_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE PaymentVoucherTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO PaymentVoucherTypes (Name) VALUES ('ReceiptVoucher'), ('PaymentVoucher');

CREATE TABLE PaymentMethods (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    DefaultAccountId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_PaymentMethods_DefaultAccount FOREIGN KEY (DefaultAccountId) REFERENCES Accounts(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_PaymentMethods_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_PaymentMethods_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE TABLE InventoryTransactions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ProductId UNIQUEIDENTIFIER NOT NULL,
    WarehouseId UNIQUEIDENTIFIER NOT NULL,
    TransactionDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    InventoryTransactionTypeId UNIQUEIDENTIFIER NOT NULL,
    Quantity DECIMAL(18, 4) NOT NULL,
    UnitPrice DECIMAL(18, 4) NULL,
    UnitOfMeasureId UNIQUEIDENTIFIER NULL,
    ReferenceDocumentId UNIQUEIDENTIFIER NULL,
    ReferenceDocumentType NVARCHAR(100) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_InventoryTransactions_Product FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryTransactions_Warehouse FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryTransactions_Type FOREIGN KEY (InventoryTransactionTypeId) REFERENCES InventoryTransactionTypes(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryTransactions_UnitOfMeasure FOREIGN KEY (UnitOfMeasureId) REFERENCES ProductUnits(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryTransactions_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_InventoryTransactions_Quantity CHECK (Quantity > 0)
);

CREATE INDEX IX_InventoryTransactions_ProductWarehouse ON InventoryTransactions(ProductId, WarehouseId, TransactionDate);
CREATE INDEX IX_InventoryTransactions_ReferenceDocument ON InventoryTransactions(ReferenceDocumentId, ReferenceDocumentType);

CREATE TABLE StockTransferOrders (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderNumber NVARCHAR(50) NOT NULL UNIQUE,
    OrderDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    SourceWarehouseId UNIQUEIDENTIFIER NOT NULL,
    DestinationWarehouseId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    Notes NVARCHAR(MAX) NULL,
    ShippedDate DATETIME2 NULL,
    ReceivedDate DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_StockTransferOrders_SourceWarehouse FOREIGN KEY (SourceWarehouseId) REFERENCES Warehouses(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_StockTransferOrders_DestinationWarehouse FOREIGN KEY (DestinationWarehouseId) REFERENCES Warehouses(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_StockTransferOrders_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_StockTransferOrders_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_StockTransferOrders_Status CHECK (Status IN ('Pending', 'Shipped', 'Received', 'Cancelled')),
    CONSTRAINT CK_StockTransferOrders_Warehouses CHECK (SourceWarehouseId <> DestinationWarehouseId)
);

CREATE INDEX IX_StockTransferOrders_Status ON StockTransferOrders(Status);
CREATE INDEX IX_StockTransferOrders_SourceWarehouse ON StockTransferOrders(SourceWarehouseId);
CREATE INDEX IX_StockTransferOrders_DestinationWarehouse ON StockTransferOrders(DestinationWarehouseId);

CREATE TABLE StockTransferOrderItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockTransferOrderId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    UnitOfMeasureId UNIQUEIDENTIFIER NULL,
    QuantityOrdered DECIMAL(18, 4) NOT NULL,
    QuantityShipped DECIMAL(18, 4) NULL DEFAULT 0,
    QuantityReceived DECIMAL(18, 4) NULL DEFAULT 0,
    Notes NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_StockTransferOrderItems_Order FOREIGN KEY (StockTransferOrderId) REFERENCES StockTransferOrders(Id) ON DELETE CASCADE,
    CONSTRAINT FK_StockTransferOrderItems_Product FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_StockTransferOrderItems_UnitOfMeasure FOREIGN KEY (UnitOfMeasureId) REFERENCES ProductUnits(Id) ON DELETE NO ACTION,
    CONSTRAINT UQ_StockTransferOrderItems_Product UNIQUE (StockTransferOrderId, ProductId, UnitOfMeasureId)
);

CREATE INDEX IX_StockTransferOrderItems_Product ON StockTransferOrderItems(ProductId);

CREATE TABLE InventoryAdjustments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AdjustmentNumber NVARCHAR(50) NOT NULL UNIQUE,
    AdjustmentDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    WarehouseId UNIQUEIDENTIFIER NOT NULL,
    ReasonId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Draft',
    Notes NVARCHAR(MAX) NULL,
    DefaultAccountId UNIQUEIDENTIFIER NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_InventoryAdjustments_Warehouse FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryAdjustments_Reason FOREIGN KEY (ReasonId) REFERENCES InventoryAdjustmentReasons(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryAdjustments_Account FOREIGN KEY (DefaultAccountId) REFERENCES Accounts(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryAdjustments_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryAdjustments_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_InventoryAdjustments_Status CHECK (Status IN ('Draft', 'Posted', 'Cancelled'))
);

CREATE INDEX IX_InventoryAdjustments_Status ON InventoryAdjustments(Status);
CREATE INDEX IX_InventoryAdjustments_Warehouse ON InventoryAdjustments(WarehouseId);
CREATE INDEX IX_InventoryAdjustments_Reason ON InventoryAdjustments(ReasonId);

CREATE TABLE InventoryAdjustmentItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    InventoryAdjustmentId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    UnitOfMeasureId UNIQUEIDENTIFIER NULL,
    QuantityChange DECIMAL(18, 4) NOT NULL,
    Cost DECIMAL(18, 4) NULL,
    Notes NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_InventoryAdjustmentItems_Adjustment FOREIGN KEY (InventoryAdjustmentId) REFERENCES InventoryAdjustments(Id) ON DELETE CASCADE,
    CONSTRAINT FK_InventoryAdjustmentItems_Product FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_InventoryAdjustmentItems_UnitOfMeasure FOREIGN KEY (UnitOfMeasureId) REFERENCES ProductUnits(Id) ON DELETE NO ACTION,
    CONSTRAINT UQ_InventoryAdjustmentItems_Product UNIQUE (InventoryAdjustmentId, ProductId, UnitOfMeasureId)
);

CREATE INDEX IX_InventoryAdjustmentItems_Product ON InventoryAdjustmentItems(ProductId);

CREATE TABLE Stocktakes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StocktakeNumber NVARCHAR(50) NOT NULL UNIQUE,
    StocktakeDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    WarehouseId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_Stocktakes_Warehouse FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Stocktakes_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Stocktakes_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_Stocktakes_Status CHECK (Status IN ('Pending', 'InProgress', 'CountCompleted', 'AdjustmentsPosted', 'Cancelled'))
);

CREATE INDEX IX_Stocktakes_Status ON Stocktakes(Status);
CREATE INDEX IX_Stocktakes_Warehouse ON Stocktakes(WarehouseId);

CREATE TABLE StocktakeItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StocktakeId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    UnitOfMeasureId UNIQUEIDENTIFIER NULL,
    BookQuantity DECIMAL(18, 4) NOT NULL,
    CountedQuantity DECIMAL(18, 4) NULL,
    Difference AS (ISNULL(CountedQuantity, 0) - BookQuantity),
    CostPrice DECIMAL(18, 4) NULL,
    IsAdjusted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_StocktakeItems_Stocktake FOREIGN KEY (StocktakeId) REFERENCES Stocktakes(Id) ON DELETE CASCADE,
    CONSTRAINT FK_StocktakeItems_Product FOREIGN KEY (ProductId) REFERENCES Products(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_StocktakeItems_UnitOfMeasure FOREIGN KEY (UnitOfMeasureId) REFERENCES ProductUnits(Id) ON DELETE NO ACTION,
    CONSTRAINT UQ_StocktakeItems_Product UNIQUE (StocktakeId, ProductId, UnitOfMeasureId)
);

CREATE INDEX IX_StocktakeItems_Product ON StocktakeItems(ProductId);

CREATE TABLE PurchaseOrders (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    OrderNumber NVARCHAR(50) NOT NULL UNIQUE,
    OrderDate DATETIME2 NOT NULL DEFAULT GETDATE(),
    SupplierId UNIQUEIDENTIFIER NOT NULL,
    ExpectedDeliveryDate DATETIME2 NULL,
    ShippingAddress NVARCHAR(MAX) NULL,
    WarehouseId UNIQUEIDENTIFIER NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Draft',
    Notes NVARCHAR(MAX) NULL,
    TotalAmount DECIMAL(18, 4) NULL DEFAULT 0.00,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CreatedBy UNIQUEIDENTIFIER NULL,
    UpdatedBy UNIQUEIDENTIFIER NULL,
    CONSTRAINT FK_PurchaseOrders_Supplier FOREIGN KEY (SupplierId) REFERENCES Contacts(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_PurchaseOrders_Warehouse FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_PurchaseOrders_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_PurchaseOrders_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT CK_PurchaseOrders_Status CHECK (Status IN ('Draft', 'Submitted', 'Approved', 'PartiallyReceived', 'Received', 'Cancelled'))
);

CREATE INDEX IX_PurchaseOrders_Status ON PurchaseOrders(Status);
CREATE INDEX IX_PurchaseOrders_Supplier ON PurchaseOrders(SupplierId);
CREATE INDEX IX_PurchaseOrders_Warehouse ON PurchaseOrders(WarehouseId);

CREATE TABLE PurchaseOrderItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PurchaseOrderId UNIQUEIDENTIFIER NOT NULL,
    ProductId UNIQUEIDENTIFIER NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Quantity DECIMAL(18, 4) NOT NULL,
    UnitPrice DECIMAL(18, 4) NOT NULL,
    DiscountPercentage DECIMAL(5, 2) NULL DEFAULT 0.00
);